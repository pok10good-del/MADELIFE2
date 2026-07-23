"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { deleteAllUserStories, getUserStories, updateStory } from "@/lib/supabase/stories";
import type { StoriesRow } from "@/lib/supabase/stories.types";
import { AppTopBar } from "@/components/AppTopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { IconTrash } from "@/app/dashboard/icons";
import "../dashboard/dashboard.css";
import "./archive.css";

function formatDateOnly(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString();
}

export default function ArchivePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const loggingOutRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  const [stories, setStories] = useState<StoriesRow[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user && !loggingOutRef.current) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setStoriesLoading(true);
    setStoriesError(null);

    getUserStories(supabase, user.id)
      .then((rows) => {
        if (!cancelled) setStories(rows);
      })
      .catch((error) => {
        if (!cancelled) {
          setStoriesError(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setStoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const episodes = useMemo(() => {
    return stories
      .filter((story) => story.status === "completed" && story.generated_content)
      .sort((a, b) => {
        if (a.episode_number !== b.episode_number) return a.episode_number - b.episode_number;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [stories]);

  const selectedEpisode = episodes.find((episode) => episode.id === selectedId) ?? null;

  if (loading || !user) {
    return <div className="dashboard-page">불러오는 중...</div>;
  }

  const handleLogout = async () => {
    loggingOutRef.current = true;
    await signOut();
    router.replace("/");
  };

  const handleOpenEpisode = async (episode: StoriesRow) => {
    setSelectedId(episode.id);

    if (episode.read_at !== null) return;

    try {
      const updated = await updateStory(supabase, user.id, episode.id, {
        read_at: new Date().toISOString(),
      });
      setStories((prev) => prev.map((story) => (story.id === updated.id ? updated : story)));
    } catch {
      // best-effort read tracking; reading the episode should not fail because of this
    }
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setDeleteTargetId(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAllUserStories(supabase, user.id);
      setStories([]);
      setSelectedId(null);
      setDeleteTargetId(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mml">
      <AppTopBar />

      <div className="mml-body">
        <AppSidebar active="archive" onLogout={handleLogout} />

        <main className="mml-main">
          <section className="mml-hero">
            <h1 className="gold-text">과거 기록 보관소</h1>
            <p>지금까지 이어져 온 당신의 이야기를 처음부터 다시 읽어보세요.</p>
          </section>

          {storiesLoading && <p className="mml-footnote">불러오는 중...</p>}

          {storiesError && (
            <p className="mml-footnote" style={{ color: "#e5484d" }}>
              {storiesError}
            </p>
          )}

          {!storiesLoading && !storiesError && episodes.length === 0 && (
            <p className="mml-footnote">아직 기록된 이야기가 없습니다.</p>
          )}

          {!storiesLoading && !storiesError && episodes.length > 0 && selectedEpisode === null && (
            <ul className="archive-toc">
              {episodes.map((episode) => (
                <li key={episode.id} className="archive-toc-row">
                  <button
                    type="button"
                    className="archive-toc-item"
                    onClick={() => handleOpenEpisode(episode)}
                  >
                    <span className="archive-toc-index">{episode.episode_number}화</span>
                    <span className="archive-toc-title">{episode.generated_title}</span>
                    {episode.read_at === null && <span className="archive-toc-unread" aria-label="읽지 않음" />}
                  </button>
                  <button
                    type="button"
                    className="archive-toc-delete"
                    aria-label={`${episode.episode_number}화 삭제`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(episode.id);
                    }}
                  >
                    <IconTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedEpisode && (
            <>
              <button
                type="button"
                className="archive-back-btn"
                onClick={() => setSelectedId(null)}
              >
                ← 목차로 돌아가기
              </button>
              <article className="archive-episode">
                <span className="archive-episode-index">{selectedEpisode.episode_number}화</span>
                <h2 className="archive-episode-title">{selectedEpisode.generated_title}</h2>
                <div className="archive-episode-meta">
                  {formatDateOnly(selectedEpisode.story_start_date)}
                  {selectedEpisode.generated_start_age !== null && selectedEpisode.generated_end_age !== null
                    ? ` · ${selectedEpisode.generated_start_age}세 - ${selectedEpisode.generated_end_age}세`
                    : ""}
                </div>
                <p className="archive-episode-content">{selectedEpisode.generated_content}</p>
              </article>
            </>
          )}
        </main>
      </div>

      {deleteTargetId && (
        <div className="archive-delete-overlay" role="dialog" aria-modal="true">
          <div className="archive-delete-modal">
            <p className="archive-delete-text">
              이 미래를 삭제하시겠습니까? 이 미래와 관련된 이야기는 더이상 미래에서 오지 않습니다.
              <br />
              또한 현재까지 배달된 모든 미래의 편지가 함께 삭제됩니다.
            </p>
            {deleteError && (
              <p className="mml-footnote" style={{ color: "#e5484d" }}>
                {deleteError}
              </p>
            )}
            <div className="archive-delete-actions">
              <button
                type="button"
                className="archive-delete-yes"
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? "삭제 중..." : "YES"}
              </button>
              <button
                type="button"
                className="archive-delete-no"
                disabled={deleting}
                onClick={handleCancelDelete}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
