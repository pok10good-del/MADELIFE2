"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!loading && !user && !loggingOutRef.current) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    loggingOutRef.current = true;
    await signOut();
    router.replace("/");
  };

  if (loading || !user) {
    return <div className="dashboard-page">불러오는 중...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1 className="gold-text" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        환영합니다, {user.user_metadata?.full_name ?? user.email}
      </h1>
      <p>{user.email}</p>
      <button className="logout-btn" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
}
