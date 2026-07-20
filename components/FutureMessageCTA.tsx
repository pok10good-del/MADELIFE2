"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

export function FutureMessageCTA() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = async () => {
    if (loading) return;

    if (!user) {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      return;
    }

    router.push("/dashboard");
  };

  return (
    <button
      className={`cta-btn gradient-gold-bg${user ? "" : " cta-btn-locked"}`}
      onClick={handleClick}
    >
      미래로 메시지 보내기
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
      </svg>
    </button>
  );
}
