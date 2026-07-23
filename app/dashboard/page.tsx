"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getUserStories, saveStory, updateStory } from "@/lib/supabase/stories";
import { mapStoryInputToStoriesInsert } from "@/lib/supabase/stories.mapper";
import type { StoriesRow } from "@/lib/supabase/stories.types";
import { buildStoryGenerationInput } from "@/lib/story-generation/build-story-generation-input";
import {
  buildContinuationStoriesInsert,
  buildContinuationStoryGenerationInput,
} from "@/lib/story-generation/build-continuation-story-generation-input";
import { mapStoryGenerationResultToStoriesUpdate } from "@/lib/story-generation/map-generation-result-to-stories-update";
import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { AppTopBar } from "@/components/AppTopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { DateCalendar } from "./DateCalendar";
import "./dashboard.css";
import {
  IconArrowRight,
  IconBank,
  IconBook,
  IconCalendar,
  IconCloudBolt,
  IconGem,
  IconHeart,
  IconMoney,
  IconMoon,
  IconQuill,
  IconShield,
  IconSmile,
  IconSoccer,
  IconStar,
  IconTrophy,
  IconUsers,
} from "./icons";

const STORY_MIN_LENGTH = 300;
const MAX_FRAGMENTS = 2;

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

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const loggingOutRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const [storyText, setStoryText] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedStoryDate, setSelectedStoryDate] = useState<Date | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [sportChoice, setSportChoice] = useState<string | null>(null);
  const [celebrityName, setCelebrityName] = useState("");
  const [shareOption, setShareOption] = useState<"private" | "friends" | "public">("private");
  const [stage, setStage] = useState<"idle" | "episode1" | "episode2" | "done">("idle");
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user && !loggingOutRef.current) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getUserStories(supabase, user.id)
      .then((rows) => {
        if (cancelled) return;
        if (rows.length > 0) {
          router.replace("/archive");
          return;
        }
        setCheckingExisting(false);
      })
      .catch(() => {
        if (!cancelled) setCheckingExisting(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading || !user || checkingExisting) {
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

  const canSubmit =
    storyText.trim().length >= STORY_MIN_LENGTH &&
    selectedPaths.length > 0;

  const requestStoryGeneration = async (input: StoryGenerationInput): Promise<StoryGenerationResult> => {
    const response = await fetch("/api/story/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "이야기 생성 중 오류가 발생했습니다.");
    }

    return (await response.json()) as StoryGenerationResult;
  };

  const handleSubmit = async () => {
    if (!canSubmit || stage !== "idle") return;

    setStage("episode1");
    setSaveError(null);

    let currentRow: StoriesRow | null = null;

    try {
      const storyInsert = mapStoryInputToStoriesInsert({
        storyText,
        birthDate: selectedDay,
        storyStartDate: selectedStoryDate,
        selectedPaths,
        sportChoice,
        celebrityName,
        shareOption,
        regretPoint: "",
      });
      currentRow = await saveStory(supabase, user.id, {
        ...storyInsert,
        user_id: user.id,
        episode_number: 1,
      });

      const episode1Input = buildStoryGenerationInput(currentRow);
      const episode1Result = await requestStoryGeneration(episode1Input);
      const episode1Row = await updateStory(
        supabase,
        user.id,
        currentRow.id,
        mapStoryGenerationResultToStoriesUpdate(episode1Result)
      );
      currentRow = episode1Row;

      setStage("episode2");

      const episode2Insert = buildContinuationStoriesInsert(episode1Row, episode1Row, 2);
      currentRow = await saveStory(supabase, user.id, { ...episode2Insert, user_id: user.id });

      const episode2Input = buildContinuationStoryGenerationInput(episode1Row, episode1Row);
      const episode2Result = await requestStoryGeneration(episode2Input);
      await updateStory(
        supabase,
        user.id,
        currentRow.id,
        mapStoryGenerationResultToStoriesUpdate(episode2Result)
      );

      setStage("done");
      router.push("/archive");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
      if (currentRow) {
        try {
          await updateStory(supabase, user.id, currentRow.id, { status: "failed" });
        } catch {
          // best-effort status update; original error is already surfaced above
        }
      }
      setStage("idle");
    }
  };

  return (
    <div className="mml">
      <AppTopBar />

      <div className="mml-body">
        <AppSidebar active="status" onLogout={handleLogout} />

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
              <DateCalendar value={selectedDay} onChange={setSelectedDay} />
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
              <DateCalendar value={selectedStoryDate} onChange={setSelectedStoryDate} minDate={tomorrow} />
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
                      <div
                        className="mml-sub-options"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
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
                      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
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

          {stage === "idle" || stage === "done" ? (
            <button
              type="button"
              className="mml-submit-btn"
              disabled={!canSubmit || stage === "done"}
              onClick={handleSubmit}
            >
              {stage === "done" ? "전송 완료" : "미래로 향한 메시지 보내기"}
              <IconArrowRight />
            </button>
          ) : (
            <div className="mml-generating-panel">
              <span className="mml-generating-text">
                미래에서 편지를 받는 중입니다
                <span className="mml-generating-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </span>
              <span className="mml-generating-sub">
                {stage === "episode1" ? "1화를 쓰는 중입니다..." : "2화를 쓰는 중입니다..."}
              </span>
            </div>
          )}
          {saveError && (
            <p className="mml-footnote" style={{ color: "#e5484d" }}>
              {saveError}
            </p>
          )}
          <p className="mml-footnote">모든 정보는 안전하게 암호화되어, AI 분석에 최적화 되어만 사용됩니다.</p>
        </main>
      </div>
    </div>
  );
}
