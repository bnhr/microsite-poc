import { useRef } from "react";
import type { Story } from "./types";
import { StorySlide } from "./story-slide";
import { useStoryPlayer } from "./use-story-player";
import { useStoryShare } from "./use-story-share";
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
  const playerRef = useRef<HTMLElement>(null);

  const { shareStatus, isCapturing, shareStory } = useStoryShare({
    activeStory,
    activeIndex,
    isPaused,
    setIsPaused,
    playerRef,
  });

  if (!activeStory) {
    return (
      <main className="story-player story-player--empty">
        <p>No stories available.</p>
      </main>
    );
  }

  return (
    <main
      ref={playerRef}
      className="story-player"
      style={
        {
          "--story-background": activeStory.background,
          "--story-accent": activeStory.accent ?? "#ffffff",
        } as React.CSSProperties
      }
      data-paused={isPaused ? "true" : "false"}
      data-capturing={isCapturing ? "true" : "false"}
    >
      <div className="story-player__background" />

      {activeStory.shareable && (
        <button
          className="story-player__share-button"
          type="button"
          onClick={shareStory}
          aria-label="Share this story"
        >
          Share
        </button>
      )}

      {activeStory.shareable && shareStatus && (
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