import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D12] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B7CFF] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D12] px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#151923] p-8 text-center">
          <h1 className="text-xl font-semibold text-red-400">Access Denied (403)</h1>
          <p className="mt-2 text-sm text-[#9298A8]">
            You do not have Super Admin permissions to access this area.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-[#8B7CFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#A397FF]"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}