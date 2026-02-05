import axios, { AxiosInstance } from "axios";
import {
  IgetUsers,
  IgetUserById,
  IpostCreateUserRequest,
  IpostCreateUserResponse,
  IpatchUpdateUser,
  IgetPosts,
  IgetPostById,
} from "./types";
import { isTMA, tgToken } from "@/lib/utils";

// =============================================================================
// Настройка API
// Замените VITE_API_BASE_URL в .env на адрес вашего API
// =============================================================================

export const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "https://jsonplaceholder.typicode.com";

// Токен авторизации: в TMA берётся из Telegram, иначе — фоллбэк для разработки
const rawToken = isTMA()
  ? tgToken
  : // Вставьте сюда тестовый токен для локальной разработки
    "";

export const token = rawToken ? `tma ${rawToken}` : "";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: token } : {}),
  },
});

// =============================================================================
// Демо-запросы — Пользователи
// =============================================================================

export const getUsers = async (params: {
  limit?: number;
  offset?: number;
  q?: string;
}) => {
  const { limit, offset, q } = params;
  const response = await axiosInstance.get<IgetUsers>(`/users`, {
    params: { limit, offset, q },
  });
  return response.data;
};

export const getUserById = async (params: { id: number }) => {
  const { id } = params;
  const response = await axiosInstance.get<IgetUserById>(`/users/${id}`);
  return response.data;
};

export const postCreateUser = async (body: IpostCreateUserRequest) => {
  const response = await axiosInstance.post<IpostCreateUserResponse>(
    `/users`,
    body
  );
  return response.data;
};

export const patchUpdateUser = async (params: {
  id: number;
  body: IpatchUpdateUser;
}) => {
  const { id, body } = params;
  const response = await axiosInstance.patch<IgetUserById>(
    `/users/${id}`,
    body
  );
  return response.data;
};

// =============================================================================
// Демо-запросы — Посты
// =============================================================================

export const getPosts = async (params: {
  limit?: number;
  offset?: number;
  q?: string;
}) => {
  const { limit, offset, q } = params;
  const response = await axiosInstance.get<IgetPosts>(`/posts`, {
    params: { limit, offset, q },
  });
  return response.data;
};

export const getPostById = async (params: { id: number }) => {
  const { id } = params;
  const response = await axiosInstance.get<IgetPostById>(`/posts/${id}`);
  return response.data;
};
