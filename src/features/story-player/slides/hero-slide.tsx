import type { HeroStory } from "../types";

type HeroSlideProps = {
  story: HeroStory;
};

export function HeroSlide({ story }: HeroSlideProps) {
  return (
    <div className="story-slide story-slide--hero">
      <h1>{story.title}</h1>

      {story.description && (
        <p className="story-slide__description">{story.description}</p>
      )}
    </div>
  );
}