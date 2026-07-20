"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export default function LoginPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  return (
    <div className="login-page">
      <h1 className="gold-text" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        MAGIC MADE LIFE
      </h1>
      <p>로그인하고 미래의 메시지를 받아보세요.</p>
      <GoogleLoginButton />
    </div>
  );
}
