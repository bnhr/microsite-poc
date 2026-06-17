import type { CoverStory } from "../types"
import TemplateA from "../../../templates/template-a"

type CoverSlideProps = {
  story: CoverStory
}

export function CoverSlide({ story }: CoverSlideProps) {
  return (
    <TemplateA
      title={story.title}
      subtitle={story.eyebrow}
      description={story.subtitle}
      background={story.background}
      accent={story.accent}
    />
  )
}
