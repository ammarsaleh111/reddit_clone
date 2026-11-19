import type { ReactNode } from "react";
import "./AuthLayout.css";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">C</div>
        <span>Connect</span>
      </div>

      <div className="auth-container">
        <div className="auth-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}
      </div>

      <p className="auth-footer">
        © 2026 Connect. All rights reserved.
      </p>
    </div>
  );
}

export default AuthLayout;