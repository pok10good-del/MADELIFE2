"use client";

import { useAuth } from "@/context/AuthContext";
import { IconBell } from "@/app/dashboard/icons";

export function AppTopBar() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="mml-topbar">
      <div className="mml-topbar-logo gold-text">MAGIC MADE LIFE</div>
      <div className="mml-topbar-right">
        <IconBell className="mml-bell" />
        <button type="button" className="mml-upgrade-pill">
          프리미엄 업그레이드
        </button>
        <div className="mml-avatar">
          {avatarUrl ? <img src={avatarUrl} alt="" width={34} height={34} /> : initial || "U"}
        </div>
      </div>
    </header>
  );
}
