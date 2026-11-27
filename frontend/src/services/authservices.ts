
import api from "./api";
import axios from "axios";
import type {
  LoginData,
  RegisterData,
} from "../features/auth/types/auth.types";

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  role: "user";
  status: "active" | "suspended" | "banned";
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: ApiUser;
  };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ message?: string }> }
      | undefined;
    const validationMessage = data?.errors
      ?.map((item) => item.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");

    return validationMessage || data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export async function login(data: LoginData): Promise<ApiUser> {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  );

  return response.data.data.user;
}

export async function register(
  data: RegisterData
): Promise<ApiUser> {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getCurrentUser(): Promise<ApiUser> {
  const response = await api.get<AuthResponse>("/auth/me");

  return response.data.data.user;
}
