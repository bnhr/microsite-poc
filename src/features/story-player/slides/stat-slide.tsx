import type { StatStory } from "../types"
import TemplateA from "../../../templates/template-a"

type StatSlideProps = {
  story: StatStory
}

export function StatSlide({ story }: StatSlideProps) {
  return (
    <TemplateA
      title={story.value}
      subtitle={story.label}
      stat={{ value: story.value, note: story.note }}
      background={story.background}
      accent={story.accent}
    />
  )
}
