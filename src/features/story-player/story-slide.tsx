import type { Story } from "./types";
import { CoverSlide } from "./slides/cover-slide";
import { HeroSlide } from "./slides/hero-slide";
import { StatSlide } from "./slides/stat-slide";
import { RankingSlide } from "./slides/ranking-slide";

type StorySlideProps = {
  story: Story;
};

export function StorySlide({ story }: StorySlideProps) {
  switch (story.type) {
    case "cover":
      return <CoverSlide story={story} />;

    case "hero":
      return <HeroSlide story={story} />;

    case "stat":
      return <StatSlide story={story} />;

    case "ranking":
      return <RankingSlide story={story} />;

    default:
      return null;
  }
}