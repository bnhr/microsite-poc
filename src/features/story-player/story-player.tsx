import { domToPng } from "modern-screenshot";
import { useEffect, useRef, useState } from "react";
import type { Story } from "./types";
import { StorySlide } from "./story-slide";
import { useStoryPlayer } from "./use-story-player";
import {
  type NativeShareTarget,
  requestNativeSnapshotShare,
  shareSnapshotOnWeb,
  subscribeToNativeShareResult,
} from "./share-adapter";
import "./story-player.css";

const DEFAULT_SHARE_TARGET: NativeShareTarget = "system";
const SNAPSHOT_WIDTH = 1600;

const SNAPSHOT_RATIO_BY_TARGET: Record<NativeShareTarget, number> = {
  system: 16 / 9,
  instagram_story: 9 / 16,
  whatsapp: 16 / 9,
  others: 16 / 9,
};

function getShareTargetFromUrl(): NativeShareTarget | null {
  const raw = new URLSearchParams(window.location.search).get("shareTarget");

  if (
    raw === "system" ||
    raw === "instagram_story" ||
    raw === "whatsapp" ||
    raw === "others"
  ) {
    return raw;
  }

  return null;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load snapshot image"));
    image.src = dataUrl;
  });
}

async function normalizeSnapshotToAspectRatio(
  dataUrl: string,
  aspectRatio: number,
): Promise<string> {
  const source = await loadImage(dataUrl);
  const targetWidth = SNAPSHOT_WIDTH;
  const targetHeight = Math.round(targetWidth / aspectRatio);
  const targetRatio = aspectRatio;
  const sourceRatio = source.width / source.height;

  let cropWidth = source.width;
  let cropHeight = source.height;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > targetRatio) {
    cropWidth = Math.round(source.height * targetRatio);
    cropX = Math.floor((source.width - cropWidth) / 2);
  } else if (sourceRatio < targetRatio) {
    cropHeight = Math.round(source.width / targetRatio);
    cropY = Math.floor((source.height - cropHeight) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create snapshot canvas");
  }

  context.drawImage(
    source,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return canvas.toDataURL("image/png");
}

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
  const [isCapturing, setIsCapturing] = useState(false);
  const playerRef = useRef<HTMLElement>(null);

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
    if (!activeStory.shareable || !playerRef.current) {
      return;
    }

    const wasPaused = isPaused;

    setIsPaused(true);
    setIsCapturing(true);
    setShareStatus("Preparing snapshot");

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const preferredTarget = getShareTargetFromUrl() ?? DEFAULT_SHARE_TARGET;
      const snapshotRatio = SNAPSHOT_RATIO_BY_TARGET[preferredTarget];

      const imageDataUrl = await domToPng(playerRef.current, {
        scale: 3,
      });
      const normalizedImageDataUrl = await normalizeSnapshotToAspectRatio(
        imageDataUrl,
        snapshotRatio,
      );

      const payload = {
        slideId: activeStory.id,
        slideIndex: activeIndex,
        title: "Kilas Balik",
        text: "Lihat kilas balik performa tokomu.",
        url: window.location.href,
        preferredTarget,
        imageDataUrl: normalizedImageDataUrl,
        fileName: `${activeStory.id}.png`,
        mimeType: "image/png" as const,
      };

      if (requestNativeSnapshotShare(payload)) {
        setShareStatus("Opening share options");
        return;
      }

      const channel = await shareSnapshotOnWeb(payload);

      if (channel === "web-image-shared") {
        setShareStatus("Shared successfully");
        return;
      }

      if (channel === "image-downloaded") {
        setShareStatus("Image downloaded");
        return;
      }

      if (channel === "unavailable") {
        setShareStatus("Share is not available on this device");
      }
    } catch {
      setShareStatus("Unable to generate share image");
    } finally {
      setIsCapturing(false);

      if (!wasPaused) {
        setIsPaused(false);
      }
    }
  };

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