"use client";

import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export function AuthHeader() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;

  return (
    <div className="auth-header">
      {user ? (
        <>
          <span className="auth-header-email">{user.email}</span>
          <button className="auth-header-logout" onClick={() => signOut()}>
            로그아웃
          </button>
        </>
      ) : (
        <GoogleLoginButton compact />
      )}
    </div>
  );
}
