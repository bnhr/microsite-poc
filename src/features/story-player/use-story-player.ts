import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "./types";

type UseStoryPlayerOptions = {
  stories: Story[];
  loop?: boolean;
};

export function useStoryPlayer({
  stories,
  loop = false,
}: UseStoryPlayerOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedProgressRef = useRef(0);

  const activeStory = stories[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === stories.length - 1;

  const cancelTimer = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const prepareSlideChange = useCallback(() => {
    cancelTimer();
    setProgress(0);
    pausedProgressRef.current = 0;
    startTimeRef.current = null;
  }, [cancelTimer]);

  const goNext = useCallback(() => {
    const next = activeIndex + 1;

    if (next >= stories.length) {
      if (!loop) return;
      prepareSlideChange();
      setActiveIndex(0);
      return;
    }

    prepareSlideChange();
    setActiveIndex(next);
  }, [activeIndex, loop, prepareSlideChange, stories.length]);

  const goPrevious = useCallback(() => {
    const previous = activeIndex - 1;

    if (previous < 0) {
      if (!loop) return;
      prepareSlideChange();
      setActiveIndex(stories.length - 1);
      return;
    }

    prepareSlideChange();
    setActiveIndex(previous);
  }, [activeIndex, loop, prepareSlideChange, stories.length]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= stories.length) return;
      if (index === activeIndex) return;

      prepareSlideChange();
      setActiveIndex(index);
    },
    [activeIndex, prepareSlideChange, stories.length]
  );

  useEffect(() => {
    if (!activeStory) return;

    if (isPaused) {
      pausedProgressRef.current = progress;
      cancelTimer();
      return;
    }

    function animate(timestamp: number) {
      if (!activeStory) return;

      if (startTimeRef.current === null) {
        startTimeRef.current =
          timestamp - pausedProgressRef.current * activeStory.duration;
      }

      const elapsed = timestamp - startTimeRef.current;
      const nextProgress = Math.min(elapsed / activeStory.duration, 1);

      setProgress(nextProgress);

      if (nextProgress >= 1) {
        if (!isLast || loop) {
          goNext();
        }

        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return cancelTimer;
  }, [
    activeStory,
    activeStory?.duration,
    cancelTimer,
    goNext,
    isLast,
    isPaused,
    loop,
    progress,
  ]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPaused(document.hidden);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrevious();
      }

      if (event.key === " ") {
        event.preventDefault();
        setIsPaused((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrevious]);

  return {
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
  };
}