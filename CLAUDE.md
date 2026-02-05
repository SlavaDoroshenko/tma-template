# Правила работы

1. Прежде чем писать код, опиши свой подход и дождись подтверждения. Всегда задавай уточняющие вопросы, если требования неясны.
2. Если задача затрагивает больше 3 файлов, остановись и разбей её на более мелкие подзадачи.
3. После написания кода, перечисли, что может сломаться, и предложи тесты для проверки.
4. При баге сначала напиши тест, который его воспроизводит, затем исправляй код, пока тест не проходит.
5. Каждый раз, когда я исправляю тебя, добавляй новое правило в CLAUDE.md файл, чтобы это больше не повторялось.
6. Весь контент (комментарии, UI текст, README, placeholder-ы, console.log) — на русском языке.

---

# Описание проекта: TMA Шаблон

Готовый production-шаблон для Telegram Mini App (TMA). Построен на основе реального проекта gym24-frontend — вся бизнес-логика удалена, архитектура и паттерны сохранены.

## Стек технологий

| Категория | Технология | Версия |
|-----------|-----------|--------|
| UI фреймворк | React | 19.2.0 |
| Язык | TypeScript (strict mode) | 5.9.3 |
| Сборка | Vite | 7.1.9 |
| Стили | Tailwind CSS 4 | 4.1.14 |
| UI компоненты | ShadCN UI (new-york стиль, Radix UI) | — |
| Иконки | Lucide React | 0.545.0 |
| Роутинг | React Router DOM | 7.9.3 |
| Анимации | Framer Motion | 12.23.22 |
| Серверный стейт | TanStack React Query | 5.90.2 |
| Клиентский стейт | Jotai (атомы) | 2.15.0 |
| HTTP-клиент | Axios | 1.12.2 |
| Формы | React Hook Form | 7.64.0 |
| Валидация | Zod | 4.1.12 |
| Тосты | Sonner | 2.0.7 |
| Деплой | Docker (Node 18 + Nginx) + Vercel | — |

## Структура проекта

```
tma-template/
├── public/                    # Статика
├── src/
│   ├── components/ui/         # 17 ShadCN компонентов (см. ниже)
│   ├── data/
│   │   ├── atoms.ts           # Jotai атомы: themeAtom, animationDirectionAtom
│   │   ├── types.ts           # TypeScript типы API (именование: I{метод}{Путь})
│   │   ├── queries.ts         # Axios функции запросов + настройка baseUrl/токена
│   │   └── hooks.ts           # React Query хуки (useQuery для GET, useMutation для POST/PATCH/DELETE)
│   ├── hooks/
│   │   ├── use-keyboard-open.ts  # Определяет открытие виртуальной клавиатуры (visualViewport API)
│   │   └── use-toast.ts          # Реэкспорт toast из sonner
│   ├── lib/
│   │   └── utils.ts           # Утилиты: cn, isTMA, tgToken, isIOS, executeHaptic,
│   │                          #   formatDateToHuman, formatDateToHumanNoTime, formatTimeFromISO,
│   │                          #   useDebounce, useDirectionalLink
│   ├── pages/
│   │   ├── HomePage.tsx       # Сетка быстрых действий + карточки фич
│   │   ├── ExplorePage.tsx    # Поиск с дебаунсом + фильтрация списка
│   │   ├── DetailPage.tsx     # Динамический роут :id, детали элемента
│   │   ├── ProfilePage.tsx    # Профиль, форма, настройки, переключатель темы
│   │   └── NotFoundPage.tsx   # 404
│   ├── App.tsx                # Корень: BrowserRouter, QueryClientProvider, Telegram init, тема
│   ├── AnimatedRoutes.tsx     # Framer Motion AnimatePresence, направленные переходы
│   ├── Wrapper.tsx            # Лейаут: нижняя навигация (3 вкладки), Telegram BackButton
│   ├── routes.tsx             # Определение маршрутов (path, name, component)
│   ├── main.tsx               # Точка входа: initTheme() + StrictMode
│   ├── index.css              # Tailwind + CSS-переменные (светлая/тёмная тема)
│   ├── global.d.ts            # Типы window.Telegram, window.TelegramWebviewProxy
│   └── vite-env.d.ts          # Типы Vite
├── scripts/
│   └── generate-api.ts        # Генератор API кода из OpenAPI/Swagger
├── index.html                 # Telegram WebApp SDK, предзагрузка темы, Inter font
├── package.json               # Зависимости + скрипты
├── tsconfig.json              # Алиасы @/* → ./src/*
├── tsconfig.app.json          # Конфиг приложения
├── tsconfig.node.json         # Конфиг для vite.config.ts (composite: true)
├── vite.config.ts             # React + Tailwind плагины, алиас @
├── eslint.config.js           # ESLint + TypeScript
├── components.json            # ShadCN конфиг (new-york, lucide, neutral)
├── Dockerfile                 # Многоступенчатая сборка (Node → Nginx)
├── docker-compose.yml         # Контейнер на порту 3000
├── vercel.json                # SPA rewrites для Vercel
├── .env.example               # VITE_API_BASE_URL
└── README.md                  # Документация на русском
```

## Архитектурные паттерны

### Поток данных API
```
Страница → useGetXxx() хук → getXxx() запрос → axiosInstance → API
                                    ↑                   ↑
                              types.ts типы       queries.ts (baseUrl, токен)
```
- GET эндпоинты → `useQuery` с queryKey для кеширования
- POST/PATCH/DELETE → `useMutation` с toast ошибки
- staleTime: 5 минут, refetchOnWindowFocus: false
- Ошибки: `error.response?.data?.errors?.[0]?.msg`

### Именование типов/функций/хуков
| HTTP метод | Тип | Функция | Хук |
|-----------|-----|---------|-----|
| GET /users | `IgetUsersResponse` | `getUsers()` | `useGetUsers()` |
| POST /users | `IpostUsersRequest` + `Response` | `postUsers()` | `usePostUsers()` |
| GET /users/{id} | `IgetUsersByidResponse` | `getUsersByid()` | `useGetUsersByid()` |

### Тема (светлая/тёмная)
- Хранится в `themeAtom` (Jotai) + `localStorage("app-theme")`
- Применяется через `data-theme="dark"` на `<html>`
- CSS-переменные в `index.css` для каждой темы
- Предзагрузка в `index.html` (до React) — без мигания
- Основные цвета: `--page`, `--foreground`, `--title`, `--accent`, `--subaccent-text`
- Акцент: синий (`59 130 246` / `96 165 250`)

### Навигация
- 5 маршрутов: `/`, `/explore`, `/detail/:id`, `/profile`, `*`
- 3 вкладки в нижней навигации: Главная, Обзор, Профиль
- Анимация переходов через `animationDirectionAtom` + Framer Motion
- `useDirectionalLink()` — навигация с направлением + хаптик
- Telegram BackButton: показывается если не на главной

### Telegram интеграция
- SDK загружается в `index.html`: `telegram-web-app.js`
- Инициализация в `App.tsx`: expand, disableVerticalSwipes, lockOrientation, requestFullscreen
- Авторизация: заголовок `Authorization: tma {token}` из `window.Telegram.WebView.initParams.tgWebAppData`
- `isTMA()` — определяет среду (Telegram / браузер)
- Скрытие навбара при открытой клавиатуре (`useKeyboardOpen`)

## ShadCN компоненты (17 шт.)

button, input, card, label, badge, dialog, drawer, form, select, tabs, switch, separator, textarea, toast, sonner, skeleton, skeleton

Стиль: `new-york`, цвет: `neutral`, радиус: `0.75rem`
Все компоненты используют `forwardRef` + Radix UI + `cn()` для мерджа классов.

## Демо-страницы

### HomePage — Главная
- 4 карточки быстрых действий (иконка + название + описание)
- 6 информационных карточек с описанием возможностей шаблона
- Адаптивная сетка: 2 колонки мобайл, 4 колонки десктоп

### ExplorePage — Обзор
- Поле поиска с `useDebounce(query, 300)`
- 8 демо-элементов с тегами, фильтрация по title/description/tag
- Клик → переход на `/detail/:id`

### DetailPage — Детали
- `useParams<{id}>()` для динамического роута
- 3 демо-элемента с полным описанием
- Кнопка "назад" с анимацией

### ProfilePage — Профиль
- Карточка профиля с градиентом
- Демо-форма (имя + email) с валидацией
- 4 пункта настроек: тема, уведомления, конфиденциальность, о приложении
- Переключатель светлой/тёмной темы

## Генератор API кода (`scripts/generate-api.ts`)

Автоматическая генерация `types.ts`, `queries.ts`, `hooks.ts` из Swagger/OpenAPI JSON.

### Запуск
```bash
# Один API
npx tsx scripts/generate-api.ts --url https://api.example.com/openapi.json --output src/data

# Несколько API через запятую (с автопрефиксами модулей)
npx tsx scripts/generate-api.ts --url https://api.com/crm/openapi.json,https://api.com/auth/openapi.json --output src/data

# Из локального файла
npx tsx scripts/generate-api.ts --file ./swagger.json --output src/data
```

### Аргументы
- `--url` — URL спецификации (или несколько через запятую)
- `--file` — путь к локальному JSON файлу
- `--output` — директория вывода (по умолчанию `src/data`)

### Что генерирует
| Файл | Перезаписывается | Содержимое |
|------|------------------|-----------|
| `types.ts` | Да | Интерфейсы для запросов/ответов/параметров |
| `queries.ts` | Да | Async функции с Axios |
| `hooks.ts` | Да | useQuery/useMutation обёртки |
| `queries-base.ts` | Нет (только 1й раз) | Настройка Axios instance |

### Особенности
- Рекурсивное разрешение `$ref` ссылок в схемах
- Поддержка: string, number, boolean, null, array, object, enum, oneOf, anyOf, allOf
- Path-параметры: подставляются в URL шаблон
- Query-параметры: передаются как `params` в axios
- Мутации с несколькими аргументами (path + body) → оборачиваются в объект:
  `mutationFn: ({ id, body }) => putUsers(id, body)`
- При нескольких URL → автопрефикс из пути (`/crm/openapi.json` → префикс `crm`)
- При одном URL → без префикса

## NPM скрипты

| Команда | Действие |
|---------|---------|
| `npm run dev` | Dev-сервер (localhost:5173) |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | Просмотр prod-сборки |
| `npm run lint` | ESLint проверка |
| `npm run generate-api` | Запуск генератора API |

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|-----------|----------|----------------------|
| `VITE_API_BASE_URL` | URL бэкенда | `https://jsonplaceholder.typicode.com` |

## CSS-переменные темы

### Светлая (по умолчанию)
- `--page: 245 245 245` — фон страницы
- `--foreground: 255 255 255` — фон карточек
- `--title: 30 30 30` — основной текст
- `--accent: 59 130 246` — акцент (синий)
- `--subaccent-text: 120 120 120` — вторичный текст

### Тёмная (`data-theme="dark"`)
- `--page: 22 22 22`
- `--foreground: 34 34 34`
- `--title: 255 255 255`
- `--accent: 96 165 250`

### Семантические цвета
- `--success: 34 197 94` (зелёный)
- `--error: 239 68 68` (красный)
- `--warning: 249 115 22` (оранжевый)
- `--info: 59 130 246` (синий)

## Ключевые утилиты (`lib/utils.ts`)

| Функция | Назначение |
|---------|-----------|
| `cn(...inputs)` | Мердж Tailwind классов (clsx + twMerge) |
| `isTMA()` | Определяет среду Telegram Mini App |
| `tgToken` | Токен авторизации из Telegram WebView |
| `isIOS()` | Определяет iOS/iPad |
| `executeHaptic()` | Хаптик-обратная связь |
| `formatDateToHuman(iso)` | "5 февраля 17:30" |
| `formatDateToHumanNoTime(iso)` | "5 февраля" |
| `formatTimeFromISO(iso)` | "17:30" |
| `useDebounce(value, delay)` | Хук дебаунса для поиска |
| `useDirectionalLink()` | Навигация с анимацией направления + хаптик |
