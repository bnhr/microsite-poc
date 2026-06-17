import type { RankingStory } from "../types";

type RankingSlideProps = {
  story: RankingStory;
};

export function RankingSlide({ story }: RankingSlideProps) {
  return (
    <div className="story-slide story-slide--ranking">
      <h1>{story.title}</h1>

      <ol>
        {story.items.map((item, index) => (
          <li key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}