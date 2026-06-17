import type { CoverStory } from "../types";

type CoverSlideProps = {
  story: CoverStory;
};

export function CoverSlide({ story }: CoverSlideProps) {
  return (
    <div className="story-slide story-slide--cover">
      <p className="story-slide__eyebrow">{story.eyebrow}</p>
      <h1>{story.title}</h1>

      {story.subtitle && <p className="story-slide__subtitle">{story.subtitle}</p>}
    </div>
  );
}