import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  type ApiUser,
} from "../services/authservices";

import type {
  LoginData,
  RegisterData,
} from "../features/auth/types/auth.types";

export type UserRole = "USER";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function mapApiUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    avatar: apiUser.avatar,
    bio: apiUser.bio,
    role: "USER",
    createdAt: apiUser.createdAt,
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the user using the server-side session cookie.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const apiUser = await getCurrentUser();

        if (active) {
          setUser(mapApiUser(apiUser));
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const apiUser = await loginService({
      email: email.trim(),
      password,
    } satisfies LoginData);

    setUser(mapApiUser(apiUser));
  }

  async function register(
    username: string,
    email: string,
    password: string
  ) {
    const apiUser = await registerService({
      username: username.trim(),
      email: email.trim(),
      password,
    } satisfies RegisterData);

    setUser(mapApiUser(apiUser));
  }

  async function logout() {
    await logoutService();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
