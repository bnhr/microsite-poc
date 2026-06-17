import type { TemplateAProps } from './types'
import './template.css'

export default function TemplateA({
  title,
  subtitle,
  image_url,
  description,
  button,
  stat,
  items,
  background,
  accent,
}: TemplateAProps) {
  return (
    <div
      className="template"
      style={
        {
          background: background ?? undefined,
          '--tpl-bg': background ?? undefined,
          '--tpl-accent': accent ?? undefined,
        } as React.CSSProperties
      }
    >
      <div className="template__backdrop" />

      {image_url && (
        <img className="template__image" src={image_url} alt="" />
      )}

      {stat ? (
        <>
          {subtitle && <p className="template__eyebrow">{subtitle}</p>}
          <strong className="template__stat-value">{stat.value}</strong>
          {stat.note && <p className="template__note">{stat.note}</p>}
        </>
      ) : items ? (
        <>
          <h1>{title}</h1>
          <ol className="template__ranking-list">
            {items.map((item, index) => (
              <li key={item} className="template__ranking-item">
                <span className="template__ranking-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="template__ranking-label">{item}</span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          {subtitle && <p className="template__eyebrow">{subtitle}</p>}
          <h1>{title}</h1>

          {description && (
            <p className="template__description">{description}</p>
          )}

          {button && (
            <a
              className="template__button"
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {button.label}
            </a>
          )}
        </>
      )}
    </div>
  )
}
