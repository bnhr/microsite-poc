export type TemplateButton = {
  label: string
  url: string
}

export type TemplateAProps = {
  title: string
  subtitle?: string
  image_url?: string
  description?: string
  button?: TemplateButton
  stat?: {
    value: string
    note?: string
  }
  items?: string[]
  background?: string
  accent?: string
}

export type TemplateBProps = {
  image_url?: string
  title: string
  subtitle?: string
  description?: string
}

export type TemplateCProps = {
  title: string
  image_url?: string
  button?: {
    label: string
    action: () => void
  }
}

export type TemplateConfig =
  | { template: 'a'; props: TemplateAProps }
  | { template: 'b'; props: TemplateBProps }
  | { template: 'c'; props: TemplateCProps }
