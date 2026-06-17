import type { TemplateCProps } from './types'
import './template.css'

export default function TemplateC({
  title,
  image_url,
  button,
}: TemplateCProps) {
  return (
    <div className="template">
      <div className="template__backdrop" />

      <h1>{title}</h1>

      {image_url && (
        <img className="template__image" src={image_url} alt="" />
      )}

      {button && (
        <button
          className="template__button"
          type="button"
          onClick={button.action}
        >
          {button.label}
        </button>
      )}
    </div>
  )
}
