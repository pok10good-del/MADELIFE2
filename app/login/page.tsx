"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export default function LoginPage() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [hasCallbackError, setHasCallbackError] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/");
    }
  }, [loading, session, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHasCallbackError(params.get("error") === "auth_callback_failed");
  }, []);

  return (
    <div className="login-page">
      <h1 className="gold-text" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        MAGIC MADE LIFE
      </h1>
      <p>로그인하고 미래의 메시지를 받아보세요.</p>
      {hasCallbackError && (
        <p className="login-error">로그인에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
      )}
      <GoogleLoginButton />
    </div>
  );
}
