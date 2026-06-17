import type { HeroStory } from "../types"
import TemplateA from "../../../templates/template-a"

type HeroSlideProps = {
  story: HeroStory
}

export function HeroSlide({ story }: HeroSlideProps) {
  return (
    <TemplateA
      title={story.title}
      description={story.description}
      background={story.background}
      accent={story.accent}
    />
  )
}
