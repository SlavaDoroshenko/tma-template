import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUsers,
  getUserById,
  postCreateUser,
  patchUpdateUser,
  getPosts,
  getPostById,
} from "./queries";

// =============================================================================
// Демо-хуки — Пользователи
// Каждый GET-эндпоинт оборачивается в useQuery, POST/PATCH — в useMutation
// =============================================================================

export const useGetUsers = (params: {
  limit?: number;
  offset?: number;
  q?: string;
}) => {
  return useQuery({
    queryKey: ["users", params.limit, params.offset, params.q],
    queryFn: () => getUsers(params),
  });
};

export const useGetUserById = (
  params: { id: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["userById", params.id],
    queryFn: () => getUserById(params),
    enabled: options?.enabled ?? true,
  });
};

export const usePostCreateUser = () => {
  return useMutation({
    mutationFn: postCreateUser,
    onError: (error: any) => {
      toast.error(
        error.response?.data?.errors?.[0]?.msg || "Произошла ошибка"
      );
    },
  });
};

export const usePatchUpdateUser = () => {
  return useMutation({
    mutationFn: patchUpdateUser,
    onError: (error: any) => {
      toast.error(
        error.response?.data?.errors?.[0]?.msg || "Произошла ошибка"
      );
    },
  });
};

// =============================================================================
// Демо-хуки — Посты
// =============================================================================

export const useGetPosts = (params: {
  limit?: number;
  offset?: number;
  q?: string;
}) => {
  return useQuery({
    queryKey: ["posts", params.limit, params.offset, params.q],
    queryFn: () => getPosts(params),
  });
};

export const useGetPostById = (
  params: { id: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["postById", params.id],
    queryFn: () => getPostById(params),
    enabled: options?.enabled ?? true,
  });
};
