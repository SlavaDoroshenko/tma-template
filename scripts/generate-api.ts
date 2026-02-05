/**
 * Генератор API кода из Swagger/OpenAPI спецификации
 *
 * Использование:
 *   npx tsx scripts/generate-api.ts --url https://api.example.com/openapi.json --output src/data
 *   npx tsx scripts/generate-api.ts --url https://api.example.com/crm/openapi.json,https://api.example.com/auth/openapi.json --output src/data
 *   npx tsx scripts/generate-api.ts --file ./swagger.json --output src/data
 *
 * Несколько URL через запятую — все эндпоинты объединяются в одни файлы.
 *
 * Генерирует 3 файла:
 *   - types.ts      — TypeScript типы для запросов и ответов
 *   - queries.ts    — Axios функции запросов
 *   - hooks.ts      — React Query хуки
 */

import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Разбор аргументов командной строки
// =============================================================================

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return undefined;
}

const specUrl = getArg("url");
const specFile = getArg("file");
const outputDir = getArg("output") || "src/data";

if (!specUrl && !specFile) {
  console.error("Ошибка: укажите --url или --file для спецификации OpenAPI");
  console.error(
    "  npx tsx scripts/generate-api.ts --url https://api.example.com/openapi.json --output src/data",
  );
  console.error(
    "  npx tsx scripts/generate-api.ts --file ./swagger.json --output src/data",
  );
  process.exit(1);
}

// =============================================================================
// Вспомогательные функции
// =============================================================================

/** Преобразование пути API в camelCase имя */
function pathToCamelCase(apiPath: string): string {
  return apiPath
    .replace(/^\//, "")
    .replace(/\{(\w+)\}/g, "By$1")
    .replace(/[/-](\w)/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

/** Первая буква в верхний регистр */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Преобразование JSON Schema типа в TypeScript тип */
function schemaToTs(schema: any, indent: number = 0): string {
  if (!schema) return "any";

  const pad = "  ".repeat(indent);
  const innerPad = "  ".repeat(indent + 1);

  // Ссылка на другую схему
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    return refName || "any";
  }

  // Массив
  if (schema.type === "array") {
    const itemType = schemaToTs(schema.items, indent);
    return `${itemType}[]`;
  }

  // Объект
  if (schema.type === "object" || schema.properties) {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const lines: string[] = ["{"];

    for (const [key, value] of Object.entries(props)) {
      const optional = required.has(key) ? "" : "?";
      const tsType = schemaToTs(value as any, indent + 1);
      lines.push(`${innerPad}${key}${optional}: ${tsType};`);
    }

    if (schema.additionalProperties) {
      const valType =
        schema.additionalProperties === true
          ? "any"
          : schemaToTs(schema.additionalProperties, indent + 1);
      lines.push(`${innerPad}[key: string]: ${valType};`);
    }

    lines.push(`${pad}}`);
    return lines.join("\n");
  }

  // Enum
  if (schema.enum) {
    return schema.enum.map((v: any) => JSON.stringify(v)).join(" | ");
  }

  // Примитивы
  switch (schema.type) {
    case "string":
      return schema.format === "date-time" ? "string" : "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    default:
      break;
  }

  // oneOf / anyOf
  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf || schema.anyOf) as any[];
    return variants.map((v) => schemaToTs(v, indent)).join(" | ");
  }

  // allOf
  if (schema.allOf) {
    const parts = (schema.allOf as any[]).map((v) => schemaToTs(v, indent));
    return parts.join(" & ");
  }

  return "any";
}

/** Получение схемы ответа для endpoint */
function getResponseSchema(responses: any): any {
  const successResponse = responses?.["200"] || responses?.["201"];
  if (!successResponse) return null;

  const content =
    successResponse.content?.["application/json"] ||
    successResponse.content?.["*/*"];
  return content?.schema || null;
}

/** Получение схемы тела запроса */
function getRequestBodySchema(requestBody: any): any {
  if (!requestBody) return null;

  const content =
    requestBody.content?.["application/json"] || requestBody.content?.["*/*"];
  return content?.schema || null;
}

/** Разрешение $ref ссылок */
function resolveRef(spec: any, ref: string): any {
  const parts = ref.replace("#/", "").split("/");
  let current = spec;
  for (const part of parts) {
    current = current?.[part];
  }
  return current;
}

/** Рекурсивное разрешение всех $ref в схеме */
function resolveAllRefs(spec: any, schema: any): any {
  if (!schema) return schema;

  if (schema.$ref) {
    const resolved = resolveRef(spec, schema.$ref);
    return resolveAllRefs(spec, resolved);
  }

  if (schema.properties) {
    const newProps: any = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      newProps[key] = resolveAllRefs(spec, value);
    }
    return { ...schema, properties: newProps };
  }

  if (schema.items) {
    return { ...schema, items: resolveAllRefs(spec, schema.items) };
  }

  if (schema.oneOf) {
    return {
      ...schema,
      oneOf: schema.oneOf.map((s: any) => resolveAllRefs(spec, s)),
    };
  }

  if (schema.anyOf) {
    return {
      ...schema,
      anyOf: schema.anyOf.map((s: any) => resolveAllRefs(spec, s)),
    };
  }

  if (schema.allOf) {
    return {
      ...schema,
      allOf: schema.allOf.map((s: any) => resolveAllRefs(spec, s)),
    };
  }

  return schema;
}

// =============================================================================
// Главная функция генерации
// =============================================================================

interface EndpointInfo {
  method: string;
  path: string;
  operationId: string;
  camelName: string;
  typeName: string;
  queryParams: { name: string; type: string; required: boolean }[];
  pathParams: { name: string; type: string }[];
  requestBodySchema: any;
  responseSchema: any;
  hasRequestBody: boolean;
  hasQueryParams: boolean;
  hasPathParams: boolean;
}

async function loadSingleSpec(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(
      `Не удалось загрузить спецификацию из ${url}: ${error instanceof Error ? error.message : "неизвестная ошибка"}`,
    );
  }
}

/**
 * Извлечение префикса модуля из URL
 *
 * Ожидаемый формат: https://api.com/module/openapi.json → "module"
 * - /crm/openapi.json → "crm"
 * - /v1/auth/swagger.json → "auth"
 * - /openapi.json → "" (без префикса)
 */
function extractPrefixFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    // Берём предпоследний сегмент пути (перед openapi.json / swagger.json)
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return segments[segments.length - 2];
    }
  } catch {
    // Ignore invalid URLs and return empty prefix
  }
  return "";
}

interface SpecWithPrefix {
  spec: any;
  prefix: string;
}

async function loadSpecs(): Promise<SpecWithPrefix[]> {
  if (specFile) {
    const content = fs.readFileSync(specFile, "utf-8");
    return [{ spec: JSON.parse(content), prefix: "" }];
  }

  if (specUrl) {
    // Поддержка нескольких URL через запятую
    const urls = specUrl.split(",").map((u) => u.trim()).filter(Boolean);
    const needPrefix = urls.length > 1;
    const results: SpecWithPrefix[] = [];
    for (const url of urls) {
      const spec = await loadSingleSpec(url);
      const prefix = needPrefix ? extractPrefixFromUrl(url) : "";
      results.push({ spec, prefix });
    }
    return results;
  }

  throw new Error("Не указан источник спецификации");
}

function parseEndpoints(spec: any, prefix: string = ""): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];
  const paths = spec.paths || {};

  for (const [apiPath, methods] of Object.entries(paths) as any) {
    for (const [method, operation] of Object.entries(methods) as any) {
      if (["get", "post", "put", "patch", "delete"].indexOf(method) === -1)
        continue;

      const rawCamelName = pathToCamelCase(apiPath);
      // При наличии префикса добавляем его к имени для уникальности
      const camelName = prefix
        ? `${prefix}${capitalize(rawCamelName)}`
        : rawCamelName;
      const typeName = `I${method}${capitalize(camelName)}`;

      // Параметры
      const parameters = operation.parameters || [];
      const queryParams = parameters
        .filter((p: any) => p.in === "query")
        .map((p: any) => ({
          name: p.name,
          type: schemaToTs(resolveAllRefs(spec, p.schema)),
          required: p.required || false,
        }));

      const pathParams = parameters
        .filter((p: any) => p.in === "path")
        .map((p: any) => ({
          name: p.name,
          type: schemaToTs(resolveAllRefs(spec, p.schema)),
        }));

      // Тело запроса и ответ
      const requestBodySchema = resolveAllRefs(
        spec,
        getRequestBodySchema(operation.requestBody),
      );
      const responseSchema = resolveAllRefs(
        spec,
        getResponseSchema(operation.responses),
      );

      endpoints.push({
        method,
        path: apiPath,
        operationId:
          operation.operationId || `${method}${capitalize(camelName)}`,
        camelName,
        typeName,
        queryParams,
        pathParams,
        requestBodySchema,
        responseSchema,
        hasRequestBody: !!requestBodySchema,
        hasQueryParams: queryParams.length > 0,
        hasPathParams: pathParams.length > 0,
      });
    }
  }

  return endpoints;
}

function generateTypes(endpoints: EndpointInfo[]): string {
  const lines: string[] = [
    "// =============================================================================",
    "// Автоматически сгенерированные типы API",
    `// Дата генерации: ${new Date().toISOString()}`,
    "// НЕ РЕДАКТИРУЙТЕ ВРУЧНУЮ — файл будет перезаписан при повторной генерации",
    "// =============================================================================",
    "",
  ];

  for (const ep of endpoints) {
    // Тип ответа
    if (ep.responseSchema) {
      lines.push(`// ${ep.method.toUpperCase()} ${ep.path} — ответ`);
      lines.push(
        `export type ${ep.typeName}Response = ${schemaToTs(ep.responseSchema)};`,
      );
      lines.push("");
    }

    // Тип тела запроса
    if (ep.hasRequestBody && ep.requestBodySchema) {
      lines.push(`// ${ep.method.toUpperCase()} ${ep.path} — тело запроса`);
      lines.push(
        `export type ${ep.typeName}Request = ${schemaToTs(ep.requestBodySchema)};`,
      );
      lines.push("");
    }

    // Тип параметров запроса
    if (ep.hasQueryParams) {
      lines.push(
        `// ${ep.method.toUpperCase()} ${ep.path} — параметры запроса`,
      );
      const paramLines = ep.queryParams.map(
        (p) => `  ${p.name}${p.required ? "" : "?"}: ${p.type};`,
      );
      lines.push(`export type ${ep.typeName}Params = {`);
      lines.push(...paramLines);
      lines.push("};");
      lines.push("");
    }
  }

  return lines.join("\n");
}

function generateQueries(endpoints: EndpointInfo[]): string {
  const lines: string[] = [
    "// =============================================================================",
    "// Автоматически сгенерированные API запросы",
    `// Дата генерации: ${new Date().toISOString()}`,
    "// НЕ РЕДАКТИРУЙТЕ ВРУЧНУЮ — файл будет перезаписан при повторной генерации",
    "// =============================================================================",
    "",
    'import { axiosInstance } from "./queries-base";',
  ];

  // Сбор импортов типов
  const typeImports: string[] = [];
  for (const ep of endpoints) {
    if (ep.responseSchema) typeImports.push(`${ep.typeName}Response`);
    if (ep.hasRequestBody && ep.requestBodySchema)
      typeImports.push(`${ep.typeName}Request`);
    if (ep.hasQueryParams) typeImports.push(`${ep.typeName}Params`);
  }

  if (typeImports.length > 0) {
    lines.push(`import {`);
    lines.push(`  ${typeImports.join(",\n  ")}`);
    lines.push(`} from "./types";`);
  }
  lines.push("");

  for (const ep of endpoints) {
    const funcName = `${ep.method}${capitalize(ep.camelName)}`;
    const responseType = ep.responseSchema ? `${ep.typeName}Response` : "any";

    // Построение параметров функции
    const funcParams: string[] = [];
    if (ep.hasPathParams) {
      for (const p of ep.pathParams) {
        funcParams.push(`${p.name}: ${p.type}`);
      }
    }
    if (ep.hasQueryParams) {
      funcParams.push(`params: ${ep.typeName}Params`);
    }
    if (ep.hasRequestBody && ep.requestBodySchema) {
      funcParams.push(`body: ${ep.typeName}Request`);
    }

    // Построение URL
    const urlExpr = `\`${ep.path.replace(/\{(\w+)\}/g, "${$1}")}\``;

    // Построение options для axios
    const axiosArgs: string[] = [urlExpr];
    if (ep.method === "get" || ep.method === "delete") {
      if (ep.hasQueryParams) {
        axiosArgs.push("{ params }");
      }
    } else {
      if (ep.hasRequestBody) {
        axiosArgs.push("body");
      }
      if (ep.hasQueryParams) {
        axiosArgs.push("{ params }");
      }
    }

    lines.push(
      `export const ${funcName} = async (${funcParams.join(", ")}) => {`,
    );
    lines.push(
      `  const response = await axiosInstance.${ep.method}<${responseType}>(${axiosArgs.join(", ")});`,
    );
    lines.push("  return response.data;");
    lines.push("};");
    lines.push("");
  }

  return lines.join("\n");
}

function generateHooks(endpoints: EndpointInfo[]): string {
  const lines: string[] = [
    "// =============================================================================",
    "// Автоматически сгенерированные React Query хуки",
    `// Дата генерации: ${new Date().toISOString()}`,
    "// НЕ РЕДАКТИРУЙТЕ ВРУЧНУЮ — файл будет перезаписан при повторной генерации",
    "// =============================================================================",
    "",
    'import { useQuery, useMutation } from "@tanstack/react-query";',
    'import { toast } from "sonner";',
  ];

  // Импорт функций запросов
  const queryImports: string[] = [];
  for (const ep of endpoints) {
    queryImports.push(`${ep.method}${capitalize(ep.camelName)}`);
  }

  lines.push(`import {`);
  lines.push(`  ${queryImports.join(",\n  ")}`);
  lines.push(`} from "./queries";`);
  lines.push("");

  for (const ep of endpoints) {
    const funcName = `${ep.method}${capitalize(ep.camelName)}`;
    const hookName = `use${capitalize(funcName)}`;

    if (ep.method === "get") {
      // useQuery хук
      const hookParams: string[] = [];
      const queryKeyParts: string[] = [`"${ep.camelName}"`];
      const callArgs: string[] = [];

      if (ep.hasPathParams) {
        for (const p of ep.pathParams) {
          hookParams.push(`${p.name}: ${p.type}`);
          queryKeyParts.push(p.name);
          callArgs.push(p.name);
        }
      }

      if (ep.hasQueryParams) {
        hookParams.push(
          `params: Parameters<typeof ${funcName}>[${ep.hasPathParams ? ep.pathParams.length : 0}]`,
        );
        queryKeyParts.push("params");
        callArgs.push("params");
      }

      lines.push(`export const ${hookName} = (${hookParams.join(", ")}) => {`);
      lines.push(`  return useQuery({`);
      lines.push(`    queryKey: [${queryKeyParts.join(", ")}],`);

      if (callArgs.length > 0) {
        lines.push(`    queryFn: () => ${funcName}(${callArgs.join(", ")}),`);
      } else {
        lines.push(`    queryFn: ${funcName},`);
      }

      lines.push(`  });`);
      lines.push(`};`);
    } else {
      // useMutation хук
      // useMutation принимает функцию с ОДНИМ аргументом,
      // поэтому при наличии нескольких параметров оборачиваем в объект
      const mutationParams: string[] = [];
      const mutationTypes: string[] = [];
      const callArgs: string[] = [];

      if (ep.hasPathParams) {
        for (const p of ep.pathParams) {
          mutationParams.push(p.name);
          mutationTypes.push(`${p.name}: ${p.type}`);
          callArgs.push(p.name);
        }
      }
      if (ep.hasRequestBody && ep.requestBodySchema) {
        mutationParams.push("body");
        mutationTypes.push(`body: Parameters<typeof ${funcName}>[${ep.pathParams.length}]`);
        callArgs.push("body");
      }

      if (mutationParams.length <= 1 && !ep.hasPathParams) {
        // Простой случай: 0 или 1 аргумент — передаём напрямую
        lines.push(`export const ${hookName} = () => {`);
        lines.push(`  return useMutation({`);
        lines.push(`    mutationFn: ${funcName},`);
      } else {
        // Несколько аргументов — деструктурируем из объекта
        const destructure = `{ ${mutationParams.join(", ")} }`;
        const typeAnnotation = `{ ${mutationTypes.join(", ")} }`;
        lines.push(`export const ${hookName} = () => {`);
        lines.push(`  return useMutation({`);
        lines.push(`    mutationFn: (${destructure}: ${typeAnnotation}) => ${funcName}(${callArgs.join(", ")}),`);
      }

      lines.push(`    onError: (error: any) => {`);
      lines.push(
        `      toast.error(error.response?.data?.errors?.[0]?.msg || "Произошла ошибка");`,
      );
      lines.push(`    },`);
      lines.push(`  });`);
      lines.push(`};`);
    }

    lines.push("");
  }

  return lines.join("\n");
}

function generateQueriesBase(): string {
  return `import axios, { AxiosInstance } from "axios";
import { isTMA, tgToken } from "@/lib/utils";

// =============================================================================
// Базовая настройка API клиента
// Этот файл НЕ перезаписывается при повторной генерации
// =============================================================================

export const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

// Токен авторизации: в TMA берётся из Telegram, иначе — фоллбэк для разработки
const rawToken = isTMA()
  ? tgToken
  : // Вставьте сюда тестовый токен для локальной разработки
    "";

export const token = rawToken ? \`tma \${rawToken}\` : "";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: token } : {}),
  },
});
`;
}

// =============================================================================
// Запуск
// =============================================================================

async function main() {
  console.log("Загрузка OpenAPI спецификации...");

  const specs = await loadSpecs();

  // Собираем все эндпоинты из всех спецификаций в один массив
  const allEndpoints: EndpointInfo[] = [];
  for (const { spec, prefix } of specs) {
    const label = prefix ? ` [${prefix}]` : "";
    console.log(
      `  Загружена: ${spec.info?.title || "Без названия"} v${spec.info?.version || "?"}${label}`,
    );
    const endpoints = parseEndpoints(spec, prefix);
    console.log(`    Эндпоинтов: ${endpoints.length}`);
    allEndpoints.push(...endpoints);
  }

  const endpoints = allEndpoints;
  console.log(`Всего эндпоинтов: ${endpoints.length}`);

  // Создание директории вывода
  const resolvedOutput = path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(resolvedOutput)) {
    fs.mkdirSync(resolvedOutput, { recursive: true });
  }

  // Генерация файлов
  const typesContent = generateTypes(endpoints);
  const queriesContent = generateQueries(endpoints);
  const hooksContent = generateHooks(endpoints);

  fs.writeFileSync(path.join(resolvedOutput, "types.ts"), typesContent);
  console.log(`  Записан: ${path.join(outputDir, "types.ts")}`);

  fs.writeFileSync(path.join(resolvedOutput, "queries.ts"), queriesContent);
  console.log(`  Записан: ${path.join(outputDir, "queries.ts")}`);

  fs.writeFileSync(path.join(resolvedOutput, "hooks.ts"), hooksContent);
  console.log(`  Записан: ${path.join(outputDir, "hooks.ts")}`);

  // queries-base.ts — создаётся только если не существует
  const queriesBasePath = path.join(resolvedOutput, "queries-base.ts");
  if (!fs.existsSync(queriesBasePath)) {
    const queriesBaseContent = generateQueriesBase();
    fs.writeFileSync(queriesBasePath, queriesBaseContent);
    console.log(
      `  Записан: ${path.join(outputDir, "queries-base.ts")} (новый)`,
    );
  } else {
    console.log(
      `  Пропущен: ${path.join(outputDir, "queries-base.ts")} (уже существует)`,
    );
  }

  console.log("\nГенерация завершена!");
  console.log(`Всего типов: ${endpoints.length * 2} (запросы + ответы)`);
  console.log(`Всего запросов: ${endpoints.length}`);
  console.log(`Всего хуков: ${endpoints.length}`);
}

main().catch((error) => {
  console.error("Ошибка генерации:", error.message);
  process.exit(1);
});
