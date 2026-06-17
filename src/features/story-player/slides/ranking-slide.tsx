import type { RankingStory } from "../types"
import TemplateA from "../../../templates/template-a"

type RankingSlideProps = {
  story: RankingStory
}

export function RankingSlide({ story }: RankingSlideProps) {
  return (
    <TemplateA
      title={story.title}
      items={story.items}
      background={story.background}
      accent={story.accent}
    />
  )
}
