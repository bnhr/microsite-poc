import { domToPng } from "modern-screenshot";
import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Story } from "./types";
import {
  type NativeShareTarget,
  requestNativeSnapshotShare,
  shareSnapshotOnWeb,
  subscribeToNativeShareResult,
} from "./share-adapter";

const DEFAULT_SHARE_TARGET: NativeShareTarget = "system";

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

type UseStoryShareOptions = {
  activeStory: Story | undefined;
  activeIndex: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  playerRef: RefObject<HTMLElement | null>;
};

export function useStoryShare({
  activeStory,
  activeIndex,
  isPaused,
  setIsPaused,
  playerRef,
}: UseStoryShareOptions) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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

  const shareStory = async () => {
    if (!activeStory?.shareable || !playerRef.current) {
      return;
    }

    const wasPaused = isPaused;

    setIsPaused(true);
    setIsCapturing(true);
    setShareStatus("Preparing snapshot");

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const preferredTarget = getShareTargetFromUrl() ?? DEFAULT_SHARE_TARGET;

      const snapshotImage = await domToPng(playerRef.current, { scale: 3 });

      const payload = {
        slideId: activeStory.id,
        slideIndex: activeIndex,
        title: "Kilas Balik",
        text: "Lihat kilas balik performa tokomu.",
        url: window.location.href,
        preferredTarget,
        imageDataUrl: snapshotImage,
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

  return { shareStatus, isCapturing, shareStory };
}
