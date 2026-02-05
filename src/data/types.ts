// =============================================================================
// Демо-типы API
// Замените на свои типы или сгенерируйте их с помощью scripts/generate-api.ts
// Именование: I{метод}{Путь} — например IgetUsers, IpostCreateUser
// =============================================================================

// --- Ответ списка пользователей ---
export type IgetUsers = {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    role: "USER" | "ADMIN" | "MODERATOR";
    created_at: string;
  }[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

// --- Ответ одного пользователя ---
export type IgetUserById = {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    avatar_url: string;
    role: "USER" | "ADMIN" | "MODERATOR";
    phone: string;
    bio: string;
    created_at: string;
    updated_at: string;
  };
};

// --- Тело запроса создания пользователя ---
export type IpostCreateUserRequest = {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
};

// --- Ответ создания пользователя ---
export type IpostCreateUserResponse = {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
  };
};

// --- Тело запроса обновления пользователя ---
export type IpatchUpdateUser = {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
};

// --- Ответ списка постов ---
export type IgetPosts = {
  success: boolean;
  data: {
    id: number;
    title: string;
    body: string;
    author_id: number;
    author_name: string;
    created_at: string;
    tags: string[];
  }[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

// --- Ответ одного поста ---
export type IgetPostById = {
  success: boolean;
  data: {
    id: number;
    title: string;
    body: string;
    author_id: number;
    author_name: string;
    created_at: string;
    updated_at: string;
    tags: string[];
    comments_count: number;
  };
};
