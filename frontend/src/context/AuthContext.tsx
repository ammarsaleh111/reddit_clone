/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "USER" | "SUPER_ADMIN";

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
  guestName: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "nexus_auth_user";

function getInitialUser(): AuthUser | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function getGuestName(): string {
  const key = "nexus_guest_name";
  let name = sessionStorage.getItem(key);
  if (!name) {
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    name = `Anonymous${num}`;
    sessionStorage.setItem(key, name);
  }
  return name;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getInitialUser());
  const [guestName] = useState<string>(() => getGuestName());

  async function login(email: string, password: string) {
    if (!password) throw new Error("Password is required");

    const isSuperAdmin = email.trim().toLowerCase() === "admin@nexus.dev";
    const loggedUser: AuthUser = {
      id: isSuperAdmin ? "admin_001" : "user_001",
      username: isSuperAdmin ? "superadmin" : email.split("@")[0] || "alex_dev",
      email: email.trim(),
      avatar: null,
      bio: isSuperAdmin
        ? "Platform Super Administrator."
        : "Systems programmer & distributed systems enthusiast.",
      role: isSuperAdmin ? "SUPER_ADMIN" : "USER",
      createdAt: "2026-09-14T10:30:00.000Z",
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
    setUser(loggedUser);
  }

  async function register(username: string, email: string, password: string) {
    if (!password) throw new Error("Password is required");

    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      avatar: null,
      bio: null,
      role: "USER",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  function updateUser(updates: Partial<AuthUser>) {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        guestName,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "SUPER_ADMIN",
        isLoading: false,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}