import { useEffect, useState } from "react";
import type { Story } from "./types";
import { StorySlide } from "./story-slide";
import { useStoryPlayer } from "./use-story-player";
import { requestShare, subscribeToNativeShareResult } from "./share-adapter";
import "./story-player.css";

type StoryPlayerProps = {
  stories: Story[];
  loop?: boolean;
};

export function StoryPlayer({ stories, loop = false }: StoryPlayerProps) {
  const {
    activeIndex,
    activeStory,
    progress,
    isPaused,
    isFirst,
    isLast,
    setIsPaused,
    goNext,
    goPrevious,
    goTo,
  } = useStoryPlayer({ stories, loop });
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!shareStatus) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShareStatus(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [shareStatus]);

  useEffect(() => {
    return subscribeToNativeShareResult((result) => {
      if (result.success) {
        setShareStatus("Shared successfully");
        return;
      }

      if (result.errorCode) {
        setShareStatus("Share failed. Please try again");
      }
    });
  }, []);

  if (!activeStory) {
    return (
      <main className="story-player story-player--empty">
        <p>No stories available.</p>
      </main>
    );
  }

  const shareStory = async () => {
    const channel = await requestShare({
      slideId: activeStory.id,
      slideIndex: activeIndex,
      title: "Kilas Balik",
      text: "Lihat kilas balik performa tokomu.",
      url: window.location.href,
      preferredTarget: "system",
    });

    if (channel === "native-requested") {
      setShareStatus("Opening share options");
      return;
    }

    if (channel === "web-shared") {
      setShareStatus("Shared successfully");
      return;
    }

    if (channel === "copied-link") {
      setShareStatus("Link copied");
      return;
    }

    if (channel === "unavailable") {
      setShareStatus("Share is not available on this device");
    }
  };

  return (
    <main
      className="story-player"
      style={
        {
          "--story-background": activeStory.background,
          "--story-accent": activeStory.accent ?? "#ffffff",
        } as React.CSSProperties
      }
      data-paused={isPaused ? "true" : "false"}
    >
      <div className="story-player__background" />

      <button
        className="story-player__share-button"
        type="button"
        onClick={shareStory}
        aria-label="Share this story"
      >
        Share
      </button>

      {shareStatus && (
        <p className="story-player__share-status" aria-live="polite">
          {shareStatus}
        </p>
      )}

      <div className="story-player__progress" aria-hidden="true">
        {stories.map((story, index) => {
          const fill =
            index < activeIndex ? 1 : index === activeIndex ? progress : 0;

          return (
            <button
              key={story.id}
              className="story-player__progress-track"
              onClick={() => goTo(index)}
              aria-label={`Go to story ${index + 1}`}
            >
              <span
                className="story-player__progress-fill"
                style={{
                  transform: `scaleX(${fill})`,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="story-player__topbar">
        <p className="story-player__counter">
          {activeIndex + 1} / {stories.length}
        </p>

        <button
          className="story-player__pause-button"
          type="button"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <button
        className="story-player__tap-zone story-player__tap-zone--left"
        type="button"
        onClick={goPrevious}
        disabled={isFirst && !loop}
        aria-label="Previous story"
      />

      <button
        className="story-player__tap-zone story-player__tap-zone--right"
        type="button"
        onClick={goNext}
        disabled={isLast && !loop}
        aria-label="Next story"
      />

      <section
        className="story-player__content"
        key={activeStory.id}
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        onPointerCancel={() => setIsPaused(false)}
        onPointerLeave={() => setIsPaused(false)}
      >
        <StorySlide story={activeStory} />
      </section>

      <p className="story-player__hint">
        Tap left/right, hold to pause, or use arrow keys.
      </p>
    </main>
  );
}