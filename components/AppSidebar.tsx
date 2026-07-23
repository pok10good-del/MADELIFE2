"use client";

import Link from "next/link";
import { IconArchive, IconHeadset, IconLogout, IconQuill, IconSettings, IconShield } from "@/app/dashboard/icons";

interface AppSidebarProps {
  active: "status" | "archive";
  onLogout: () => void;
}

export function AppSidebar({ active, onLogout }: AppSidebarProps) {
  return (
    <aside className="mml-sidebar">
      <div className="mml-sidebar-heading">
        <div className="mml-sidebar-heading-icon">
          <IconQuill />
        </div>
        <div>
          <div className="mml-sidebar-heading-title">기록자</div>
          <div className="mml-sidebar-heading-sub">운명의 여행자</div>
        </div>
      </div>

      <nav className="mml-sidebar-nav">
        <Link href="/dashboard" className={active === "status" ? "active" : ""}>
          <IconShield /> 기록 상태
        </Link>
        <Link href="/archive" className={active === "archive" ? "active" : ""}>
          <IconArchive /> 과거 기록 보관소
        </Link>
        <button type="button">
          <IconSettings /> 설정
        </button>
      </nav>

      <div className="mml-sidebar-spacer" />

      <div className="mml-sidebar-bottom">
        <button type="button" className="mml-sidebar-upgrade-btn">
          프리미엄으로 업그레이드
        </button>
        <button type="button" className="mml-sidebar-link">
          <IconHeadset /> 고객센터
        </button>
        <button type="button" className="mml-sidebar-link" onClick={onLogout}>
          <IconLogout /> 로그아웃
        </button>
      </div>
    </aside>
  );
}
