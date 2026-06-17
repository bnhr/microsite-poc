import type { StatStory } from "../types";

type StatSlideProps = {
  story: StatStory;
};

export function StatSlide({ story }: StatSlideProps) {
  return (
    <div className="story-slide story-slide--stat">
      <p className="story-slide__label">{story.label}</p>
      <strong>{story.value}</strong>

      {story.note && <p className="story-slide__note">{story.note}</p>}
    </div>
  );
}