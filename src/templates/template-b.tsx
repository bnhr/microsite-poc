import type { TemplateBProps } from './types'
import './template.css'

export default function TemplateB({
  image_url,
  title,
  subtitle,
  description,
}: TemplateBProps) {
  return (
    <div className="template">
      <div className="template__backdrop" />

      {image_url && (
        <img className="template__image" src={image_url} alt="" />
      )}

      <h1>{title}</h1>

      {subtitle && <p className="template__subtitle">{subtitle}</p>}

      {description && (
        <p className="template__description">{description}</p>
      )}
    </div>
  )
}
