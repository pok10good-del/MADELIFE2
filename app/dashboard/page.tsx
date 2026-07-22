"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { saveStory, getUserStories } from "@/lib/supabase/stories";
import { mapStoryInputToStoriesInsert } from "@/lib/supabase/stories.mapper";
import type { StoriesRow, StoriesStatus } from "@/lib/supabase/stories.types";
import "./dashboard.css";
import {
  IconArchive,
  IconArrowRight,
  IconBank,
  IconBell,
  IconBook,
  IconCalendar,
  IconCloudBolt,
  IconGem,
  IconHeadset,
  IconHeart,
  IconLogout,
  IconMoney,
  IconMoon,
  IconQuill,
  IconSettings,
  IconShield,
  IconSmile,
  IconSoccer,
  IconStar,
  IconTrophy,
  IconUsers,
} from "./icons";

const STORY_MIN_LENGTH = 300;
const MAX_FRAGMENTS = 2;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const SELECTED_STORY_ID_KEY = "mml:selectedStoryId";
type StatusFilter = "전체" | StoriesStatus;
const STATUS_FILTERS: StatusFilter[] = ["전체", "pending", "processing", "active", "completed"];
type SortOrder = "최신순" | "오래된순";
const SORT_ORDERS: SortOrder[] = ["최신순", "오래된순"];
type DateFilter = "전체" | "오늘" | "최근 7일" | "최근 30일";
const DATE_FILTERS: DateFilter[] = ["전체", "오늘", "최근 7일", "최근 30일"];

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function isWithinDateFilter(createdAt: string, filter: DateFilter, now: Date): boolean {
  if (filter === "전체") return true;
  const createdDate = new Date(createdAt);
  if (filter === "오늘") return isSameLocalDay(createdDate, now);
  const days = filter === "최근 7일" ? 7 : 30;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return createdDate.getTime() >= cutoff;
}

const FREE_FRAGMENTS = [
  { id: "success", label: "성공", Icon: IconTrophy },
  { id: "love", label: "사랑", Icon: IconHeart },
  { id: "family", label: "가족", Icon: IconUsers },
  { id: "happiness", label: "행복", Icon: IconSmile },
  { id: "honor", label: "명예", Icon: IconStar },
  { id: "knowledge", label: "지식", Icon: IconBook },
  { id: "misfortune", label: "불행", Icon: IconCloudBolt },
];

const PAID_PATHS = [
  {
    id: "path-greatness",
    title: "경제적으로 높은 위치의 성공",
    desc: "사회적으로의 업적과 성공을 이룸",
    Icon: IconMoney,
  },
  {
    id: "path-growth",
    title: "인플루언서/연예인으로써의 성공",
    desc: "우연치 않은 기회로 연예계나 인플루언서로 직업을 바꾸게 되며 성공",
    Icon: IconShield,
  },
  {
    id: "path-shine",
    title: "운명을 초월한 존재",
    desc: "평범한 인간의 삶을 벗어난 이야기",
    Icon: IconStar,
  },
  {
    id: "path-politics",
    title: "정치인으로서의 성공",
    desc: "정치인으로서 영향력 있는 미래를 이루는 길",
    Icon: IconBank,
  },
  {
    id: "path-sports",
    title: "스포츠 선수로서의 성공",
    desc: "스포츠 선수로서 최고의 자리에 오르는 길",
    Icon: IconSoccer,
    hasSport: true,
  },
  {
    id: "path-celebrity",
    title: "연예인과의 사랑",
    desc: "연예인과 특별한 사랑을 이루는 로맨스의 길",
    Icon: IconHeart,
    hasCelebrity: true,
  },
];

const SPORT_OPTIONS = ["축구", "야구", "농구"];

function buildCalendarGrid(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; offset: -1 | 0 | 1 }[] = [];

  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: prevMonthDays - firstDow + 1 + i, offset: -1 });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, offset: 0 });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, offset: 1 });
  }
  return cells;
}

function formatDateOnly(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const loggingOutRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  const [storyText, setStoryText] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedStoryDate, setSelectedStoryDate] = useState<Date | null>(null);
  const [storyViewYear, setStoryViewYear] = useState(today.getFullYear());
  const [storyViewMonth, setStoryViewMonth] = useState(today.getMonth());
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [sportChoice, setSportChoice] = useState<string | null>(null);
  const [celebrityName, setCelebrityName] = useState("");
  const [shareOption, setShareOption] = useState<"private" | "friends" | "public">("private");
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stories, setStories] = useState<StoriesRow[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<StoriesRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("최신순");
  const [dateFilter, setDateFilter] = useState<DateFilter>("전체");

  const fetchStories = async (userId: string) => {
    setStoriesLoading(true);
    setStoriesError(null);
    try {
      const rows = await getUserStories(supabase, userId);
      setStories(rows);

      const savedId = localStorage.getItem(SELECTED_STORY_ID_KEY);
      const restored = savedId ? rows.find((row) => row.id === savedId) ?? null : null;
      setSelectedStory(restored);
    } catch (error) {
      setStoriesError(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
    } finally {
      setStoriesLoading(false);
    }
  };

  const handleDeselectStory = () => {
    setSelectedStory(null);
    localStorage.removeItem(SELECTED_STORY_ID_KEY);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("전체");
    setSortOrder("최신순");
    setDateFilter("전체");
  };

  const sortedStories = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const now = new Date();
    const filtered = stories
      .filter((story) => statusFilter === "전체" || story.status === statusFilter)
      .filter((story) => story.story_text.toLowerCase().includes(normalizedSearchQuery))
      .filter((story) => isWithinDateFilter(story.created_at, dateFilter, now));
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === "최신순" ? -diff : diff;
    });
  }, [stories, searchQuery, statusFilter, dateFilter, sortOrder]);

  useEffect(() => {
    if (!loading && !user && !loggingOutRef.current) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchStories(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading || !user) {
    return <div className="dashboard-page">불러오는 중...</div>;
  }

  const handleLogout = async () => {
    loggingOutRef.current = true;
    await signOut();
    router.replace("/");
  };

  const toggleFragment = (id: string) => {
    setSelectedPaths((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= MAX_FRAGMENTS) return prev;
      return [...prev, id];
    });
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleStoryPrevMonth = () => {
    if (storyViewMonth === 0) {
      setStoryViewYear((y) => y - 1);
      setStoryViewMonth(11);
    } else {
      setStoryViewMonth((m) => m - 1);
    }
  };

  const handleStoryNextMonth = () => {
    if (storyViewMonth === 11) {
      setStoryViewYear((y) => y + 1);
      setStoryViewMonth(0);
    } else {
      setStoryViewMonth((m) => m + 1);
    }
  };

  const calendarCells = buildCalendarGrid(viewYear, viewMonth);
  const storyCalendarCells = buildCalendarGrid(storyViewYear, storyViewMonth);

  const displayName = user.user_metadata?.full_name ?? user.email ?? "";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = displayName.charAt(0).toUpperCase();

  const canSubmit = storyText.trim().length >= STORY_MIN_LENGTH && selectedPaths.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSaving || submitted) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const storyInsert = mapStoryInputToStoriesInsert({
        storyText,
        birthDate: selectedDay,
        storyStartDate: selectedStoryDate,
        selectedPaths,
        sportChoice,
        celebrityName,
        shareOption,
      });
      await saveStory(supabase, user.id, { ...storyInsert, user_id: user.id });
      setSubmitted(true);
      await fetchStories(user.id);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mml">
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

      <div className="mml-body">
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
            <button type="button" className="active">
              <IconShield /> 기록 상태
            </button>
            <button type="button">
              <IconArchive /> 과거 기록 보관소
            </button>
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
            <button type="button" className="mml-sidebar-link" onClick={handleLogout}>
              <IconLogout /> 로그아웃
            </button>
          </div>
        </aside>

        <main className="mml-main">
          <section className="mml-hero">
            <IconMoon className="mml-hero-moon" />
            <h1 className="gold-text">운명을 그리다</h1>
            <p>
              당신의 삶은 하나의 대서사시입니다.
              <br />
              매일 8시, 당신만을 위한 이야기가 펼쳐지고,
              <br />
              눈부신 미래의 궤적을 수정하세요.
            </p>
          </section>

          <section className="mml-panel">
            <h2 className="mml-panel-title">
              <IconQuill /> 당신의 이야기를 들려주세요.
            </h2>
            <p className="mml-panel-sub">최소 300자 이상의 당신의 회상과 현재 계획을 들려주세요.</p>
            <textarea
              className="mml-textarea"
              placeholder="이곳에 당신의 삶과 목표에 대해 자유롭게 작성해주세요..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
            />
            <div className={`mml-char-count${storyText.length >= STORY_MIN_LENGTH ? " ok" : ""}`}>
              {storyText.length} / {STORY_MIN_LENGTH} characters
            </div>
          </section>

          <div className="mml-grid-2">
            <section className="mml-panel">
              <h3 className="mml-field-label">
                <IconCalendar /> 생년월일 선택
              </h3>
              <input
                className="mml-input"
                readOnly
                value={
                  selectedDay
                    ? `${selectedDay.getFullYear()}년 ${selectedDay.getMonth() + 1}월 ${selectedDay.getDate()}일`
                    : ""
                }
                placeholder="YYYY년 MM월 DD일"
              />
              <div className="mml-calendar">
                <div className="mml-calendar-head">
                  <button type="button" onClick={handlePrevMonth}>
                    ‹
                  </button>
                  <span>
                    {viewYear}년 {viewMonth + 1}월
                  </span>
                  <button type="button" onClick={handleNextMonth}>
                    ›
                  </button>
                </div>
                <div className="mml-calendar-grid">
                  {DOW.map((d) => (
                    <div key={d} className="dow">
                      {d}
                    </div>
                  ))}
                  {calendarCells.map((cell, i) => {
                    const isSelected =
                      cell.offset === 0 &&
                      selectedDay?.getFullYear() === viewYear &&
                      selectedDay?.getMonth() === viewMonth &&
                      selectedDay?.getDate() === cell.day;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`${cell.offset !== 0 ? "muted" : ""}${isSelected ? " selected" : ""}`}
                        onClick={() => cell.offset === 0 && setSelectedDay(new Date(viewYear, viewMonth, cell.day))}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mml-panel">
              <h3 className="mml-field-label">
                <IconBook /> 이야기가 시작되는 해
              </h3>
              <input
                className="mml-input"
                readOnly
                value={
                  selectedStoryDate
                    ? `${selectedStoryDate.getFullYear()}년 ${selectedStoryDate.getMonth() + 1}월 ${selectedStoryDate.getDate()}일`
                    : ""
                }
                placeholder="YYYY년 MM월 DD일"
              />
              <div className="mml-calendar">
                <div className="mml-calendar-head">
                  <button type="button" onClick={handleStoryPrevMonth}>
                    ‹
                  </button>
                  <span>
                    {storyViewYear}년 {storyViewMonth + 1}월
                  </span>
                  <button type="button" onClick={handleStoryNextMonth}>
                    ›
                  </button>
                </div>
                <div className="mml-calendar-grid">
                  {DOW.map((d) => (
                    <div key={d} className="dow">
                      {d}
                    </div>
                  ))}
                  {storyCalendarCells.map((cell, i) => {
                    const isSelected =
                      cell.offset === 0 &&
                      selectedStoryDate?.getFullYear() === storyViewYear &&
                      selectedStoryDate?.getMonth() === storyViewMonth &&
                      selectedStoryDate?.getDate() === cell.day;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`${cell.offset !== 0 ? "muted" : ""}${isSelected ? " selected" : ""}`}
                        onClick={() =>
                          cell.offset === 0 &&
                          setSelectedStoryDate(new Date(storyViewYear, storyViewMonth, cell.day))
                        }
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <section className="mml-panel">
            <h2 className="mml-panel-title">
              <IconGem /> 운명의 조각 선택
            </h2>
            <p className="mml-fragment-note">유/무료 합산 총 {MAX_FRAGMENTS}가지 선택가능 · 운명의 길 유형</p>

            <span className="mml-tag-label">무료 선택</span>
            <div className="mml-free-grid">
              {FREE_FRAGMENTS.map(({ id, label, Icon }) => {
                const selected = selectedPaths.includes(id);
                const disabled = !selected && selectedPaths.length >= MAX_FRAGMENTS;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`mml-free-card${selected ? " selected" : ""}`}
                    disabled={disabled}
                    onClick={() => toggleFragment(id)}
                  >
                    <Icon />
                    <span className="label">{label}</span>
                    <span className="dot" />
                  </button>
                );
              })}
            </div>

            <span className="mml-tag-label" style={{ marginTop: 22 }}>
              선택의 길 (유료 선택)
            </span>
            <div className="mml-paid-grid">
              {PAID_PATHS.map(({ id, title, desc, Icon, hasSport, hasCelebrity }) => {
                const selected = selectedPaths.includes(id);
                const disabled = !selected && selectedPaths.length >= MAX_FRAGMENTS;
                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-pressed={selected}
                    aria-disabled={disabled}
                    className={`mml-paid-card${selected ? " selected" : ""}${disabled ? " disabled" : ""}`}
                    onClick={() => !disabled && toggleFragment(id)}
                    onKeyDown={(e) => {
                      if (!disabled && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        toggleFragment(id);
                      }
                    }}
                  >
                    <div className="mml-paid-card-top">
                      <Icon />
                      <span className="mml-paid-card-title">{title}</span>
                    </div>
                    <p className="mml-paid-card-desc">{desc}</p>

                    {hasSport && (
                      <div className="mml-sub-options" onClick={(e) => e.stopPropagation()}>
                        {SPORT_OPTIONS.map((sport) => (
                          <button
                            key={sport}
                            type="button"
                            className={sportChoice === sport ? "selected" : ""}
                            onClick={() => setSportChoice(sport)}
                          >
                            {sport}
                          </button>
                        ))}
                      </div>
                    )}

                    {hasCelebrity && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          className="mml-inline-input"
                          placeholder="연예인 이름을 입력해주세요."
                          value={celebrityName}
                          onChange={(e) => setCelebrityName(e.target.value)}
                        />
                        <p className="mml-inline-hint">EX) 블랙핑크 지수, 아이브 장원영 등</p>
                      </div>
                    )}

                    <div className="mml-paid-card-foot">
                      <span className="dot" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mml-panel mml-share-row">
            <span>이 스토리를 누구와 공유하시겠어요?</span>
            <div className="mml-share-options">
              <label>
                <input
                  type="radio"
                  checked={shareOption === "private"}
                  onChange={() => setShareOption("private")}
                />
                비공개
              </label>
              <label>
                <input
                  type="radio"
                  checked={shareOption === "friends"}
                  onChange={() => setShareOption("friends")}
                />
                친구에게만
              </label>
              <label>
                <input
                  type="radio"
                  checked={shareOption === "public"}
                  onChange={() => setShareOption("public")}
                />
                전체공개
              </label>
            </div>
          </section>

          <button
            type="button"
            className="mml-submit-btn"
            disabled={!canSubmit || isSaving || submitted}
            onClick={handleSubmit}
          >
            {isSaving ? "저장 중..." : submitted ? "전송 완료" : "미래로 향한 메시지 보내기"}
            <IconArrowRight />
          </button>
          {saveError && (
            <p className="mml-footnote" style={{ color: "#e5484d" }}>
              {saveError}
            </p>
          )}
          <p className="mml-footnote">모든 정보는 안전하게 암호화되어, AI 분석에 최적화 되어만 사용됩니다.</p>

          <section className="mml-panel">
            <h2 className="mml-panel-title">
              <IconArchive /> 저장된 스토리
            </h2>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="스토리 내용 검색"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                background: "transparent",
                color: "inherit",
                marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  style={{
                    border:
                      filter === statusFilter
                        ? "1px solid var(--gold)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: 12,
                    background: filter === statusFilter ? "rgba(212, 175, 55, 0.1)" : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {SORT_ORDERS.map((order) => (
                <button
                  key={order}
                  type="button"
                  onClick={() => setSortOrder(order)}
                  style={{
                    border:
                      order === sortOrder
                        ? "1px solid var(--gold)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: 12,
                    background: order === sortOrder ? "rgba(212, 175, 55, 0.1)" : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {order}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {DATE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDateFilter(filter)}
                  style={{
                    border:
                      filter === dateFilter
                        ? "1px solid var(--gold)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    fontSize: 12,
                    background: filter === dateFilter ? "rgba(212, 175, 55, 0.1)" : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.8,
                }}
              >
                조건 초기화
              </button>
            </div>

            {storiesLoading && <p className="mml-footnote">불러오는 중...</p>}

            {storiesError && (
              <p className="mml-footnote" style={{ color: "#e5484d" }}>
                {storiesError}
              </p>
            )}

            {!storiesLoading && !storiesError && stories.length === 0 && (
              <p className="mml-footnote">저장된 스토리가 없습니다.</p>
            )}

            {!storiesLoading && !storiesError && stories.length > 0 && sortedStories.length === 0 && (
              <p className="mml-footnote">조건에 맞는 스토리가 없습니다.</p>
            )}

            {!storiesLoading && !storiesError && sortedStories.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sortedStories.map((story) => {
                  const isSelected = story.id === selectedStory?.id;
                  return (
                    <div
                      key={story.id}
                      onClick={() => {
                        setSelectedStory(story);
                        localStorage.setItem(SELECTED_STORY_ID_KEY, story.id);
                      }}
                      style={{
                        border: isSelected
                          ? "1px solid var(--gold)"
                          : "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "rgba(212, 175, 55, 0.1)" : "transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          opacity: 0.8,
                        }}
                      >
                        <span>{story.story_start_date}</span>
                        <span>{story.status}</span>
                      </div>
                      <p style={{ margin: "8px 0" }}>
                        {story.story_text.length > 120
                          ? `${story.story_text.slice(0, 120)}...`
                          : story.story_text}
                      </p>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>{story.created_at}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedStory && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={handleDeselectStory}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 12,
                      color: "inherit",
                      cursor: "pointer",
                      opacity: 0.8,
                    }}
                  >
                    선택 해제
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "6px 12px",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ opacity: 0.6 }}>시작일</span>
                  <span>{formatDateOnly(selectedStory.story_start_date)}</span>
                  <span style={{ opacity: 0.6 }}>상태</span>
                  <span>{selectedStory.status}</span>
                  <span style={{ opacity: 0.6 }}>공유 설정</span>
                  <span>{selectedStory.share_option}</span>
                  <span style={{ opacity: 0.6 }}>생성일</span>
                  <span>{formatDateTime(selectedStory.created_at)}</span>
                  <span style={{ opacity: 0.6 }}>수정일</span>
                  <span>{formatDateTime(selectedStory.updated_at)}</span>
                </div>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{selectedStory.story_text}</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
