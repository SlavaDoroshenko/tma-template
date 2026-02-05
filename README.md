# TMA Шаблон — Telegram Mini App

Готовый шаблон для создания Telegram Mini App с современным стеком технологий.

## Технологии

- **React 19** + **TypeScript** — основа приложения
- **Vite** — сборка и dev-сервер
- **Tailwind CSS 4** — утилитарные стили
- **ShadCN UI** — готовые компоненты (Radix UI + Tailwind)
- **React Router** — маршрутизация с анимированными переходами
- **Framer Motion** — анимации переходов страниц
- **TanStack React Query** — управление серверным состоянием (кеширование, ретраи)
- **Jotai** — атомарное клиентское состояние (тема, UI)
- **Axios** — HTTP-клиент с авторизацией Telegram
- **React Hook Form + Zod** — формы с валидацией
- **Docker + Vercel** — деплой

## Быстрый старт

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/your-username/tma-template.git
cd tma-template

# 2. Установите зависимости
npm install

# 3. Скопируйте .env файл
cp .env.example .env

# 4. Запустите dev-сервер
npm run dev
```

Откройте http://localhost:5173 в браузере.

## Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newapp` и укажите URL вашего приложения
3. Для разработки используйте ngrok или аналог для HTTPS туннеля

## Структура проекта

```
src/
├── components/ui/       # ShadCN UI компоненты
├── data/
│   ├── atoms.ts         # Jotai атомы (тема, направление анимации)
│   ├── types.ts         # TypeScript типы API ответов
│   ├── queries.ts       # Axios функции запросов
│   └── hooks.ts         # React Query хуки
├── hooks/               # Кастомные React хуки
├── lib/utils.ts         # Утилиты (cn, isTMA, useDirectionalLink, и т.д.)
├── pages/               # Страницы приложения
├── App.tsx              # Корневой компонент (Router, QueryClient, Telegram init)
├── AnimatedRoutes.tsx   # Анимированные переходы Framer Motion
├── Wrapper.tsx          # Лейаут: навигация, шапка, Telegram BackButton
├── routes.tsx           # Определение маршрутов
└── index.css            # Tailwind + CSS переменные (светлая/тёмная тема)
```

## Как добавить новую страницу

1. Создайте файл в `src/pages/MyPage.tsx`
2. Добавьте маршрут в `src/routes.tsx`:
   ```tsx
   import MyPage from "./pages/MyPage";

   export const routes = [
     // ...существующие маршруты
     { path: "/my-page", name: "Моя страница", component: <MyPage /> },
   ];
   ```
3. Добавьте навигацию (опционально) в `src/Wrapper.tsx`

## Как добавить API эндпоинт

1. Добавьте тип ответа в `src/data/types.ts`:
   ```tsx
   export type IgetProducts = {
     success: boolean;
     data: { id: number; name: string; price: number }[];
   };
   ```

2. Добавьте функцию запроса в `src/data/queries.ts`:
   ```tsx
   export const getProducts = async () => {
     const response = await axiosInstance.get<IgetProducts>("/products");
     return response.data;
   };
   ```

3. Добавьте хук в `src/data/hooks.ts`:
   ```tsx
   export const useGetProducts = () => {
     return useQuery({
       queryKey: ["products"],
       queryFn: getProducts,
     });
   };
   ```

4. Используйте в компоненте:
   ```tsx
   const { data, isLoading } = useGetProducts();
   ```

## Генератор API кода

Автоматическая генерация типов, запросов и хуков из Swagger/OpenAPI спецификации.

### Использование

```bash
# Один API — из URL
npx tsx scripts/generate-api.ts --url "https://api.example.com/openapi.json" --output src/data

# Один API — из локального файла
npx tsx scripts/generate-api.ts --file "./swagger.json" --output src/data

# Несколько API — через запятую (все эндпоинты в одних файлах)
npx tsx scripts/generate-api.ts --url "https://api.example.com/crm/openapi.json,https://api.example.com/auth/openapi.json" --output src/data
```

При указании нескольких URL через запятую к именам автоматически добавляется префикс модуля
(извлекается из URL: `/crm/openapi.json` → префикс `crm`), чтобы избежать дубликатов.
При одном URL — без префикса.

### Что генерируется

| Файл | Содержимое | Перезаписывается |
|------|-----------|------------------|
| `types.ts` | TypeScript типы для всех запросов и ответов | Да |
| `queries.ts` | Axios функции для каждого эндпоинта | Да |
| `hooks.ts` | React Query хуки (useQuery для GET, useMutation для POST/PUT/PATCH/DELETE) | Да |
| `queries-base.ts` | Базовая настройка Axios (baseURL, авторизация) | Нет (только при первом запуске) |

### Пример сгенерированного кода

Для эндпоинта `GET /users/{id}` генератор создаст:

**types.ts:**
```typescript
export type IgetUsersByidResponse = {
  success: boolean;
  data: { id: number; name: string; email: string };
};
```

**queries.ts:**
```typescript
export const getUsersByid = async (id: number) => {
  const response = await axiosInstance.get<IgetUsersByidResponse>(`/users/${id}`);
  return response.data;
};
```

**hooks.ts:**
```typescript
export const useGetUsersByid = (id: number) => {
  return useQuery({
    queryKey: ["usersByid", id],
    queryFn: () => getUsersByid(id),
  });
};
```

Для мутаций с несколькими параметрами (path + body) аргументы оборачиваются в объект:

```typescript
// Хук
export const usePutUsersByid = () => {
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: IputUsersByidRequest }) =>
      putUsersByid(id, body),
  });
};

// Использование
const updateUser = usePutUsersByid();
updateUser.mutate({ id: 123, body: { name: "Новое имя" } });
```

### Именование

| Эндпоинт | Тип | Запрос | Хук |
|----------|-----|--------|-----|
| `GET /users` | `IgetUsersResponse` | `getUsers()` | `useGetUsers()` |
| `POST /users` | `IpostUsersRequest/Response` | `postUsers()` | `usePostUsers()` |
| `GET /users/{id}` | `IgetUsersByidResponse` | `getUsersByid()` | `useGetUsersByid()` |
| `DELETE /users/{id}` | `IdeleteUsersByidResponse` | `deleteUsersByid()` | `useDeleteUsersByid()` |

При нескольких API добавляется префикс: `IgetCrmUsersResponse`, `useGetCrmUsers()` и т.д.

## Деплой

### Vercel

```bash
npm run build
# Деплой через vercel CLI или GitHub интеграцию
```

### Docker

```bash
docker-compose up --build
# Приложение доступно на http://localhost:3100
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка для продакшена |
| `npm run preview` | Просмотр собранного приложения |
| `npm run lint` | Проверка ESLint |
| `npm run generate-api` | Запуск генератора API |

## Переменные окружения

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `VITE_API_BASE_URL` | URL вашего API | `https://api.example.com` |

## Лицензия

MIT
