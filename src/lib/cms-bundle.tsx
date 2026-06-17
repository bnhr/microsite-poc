/**
 * CMS Template Preview Bundle
 *
 * Standalone IIFE bundle for embedding template previews in CMS systems.
 * Only bundles static template components — no player logic, share, or navigation.
 *
 * Usage in CMS:
 * ```html
 * <div id="cms-preview"></div>
 * <script src="story-player.min.js"></script>
 * <script>
 *   TemplatePreview.mount('cms-preview', {
 *     template: 'a',
 *     props: { title: 'Hello', subtitle: 'World' }
 *   })
 * </script>
 * ```
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TemplateA from '../templates/template-a'
import TemplateB from '../templates/template-b'
import TemplateC from '../templates/template-c'
import type { TemplateConfig } from '../templates/types'

type TemplatePreviewGlobalApi = {
  mount: typeof mount
  unmount: typeof unmount
}

type ReactRoot = {
  unmount: () => void
}

const roots = new Map<string, ReactRoot>()

function mount(elementId: string, config: TemplateConfig): void {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`TemplatePreview: element "#${elementId}" not found`)
    return
  }

  unmount(elementId)

  const root = createRoot(element)
  const template = renderTemplate(config)
  root.render(<StrictMode>{template}</StrictMode>)
  roots.set(elementId, root)
}

function unmount(elementId: string): void {
  const root = roots.get(elementId)
  if (root) {
    root.unmount()
    roots.delete(elementId)
  }
}

function renderTemplate(config: TemplateConfig) {
  switch (config.template) {
    case 'a':
      return <TemplateA {...config.props} />
    case 'b':
      return <TemplateB {...config.props} />
    case 'c':
      return <TemplateC {...config.props} />
  }
}

declare global {
  interface Window {
    TemplatePreview: {
      mount: typeof mount
      unmount: typeof unmount
    }
  }
}

if (typeof window !== 'undefined') {
  ;(window as Window & { TemplatePreview: TemplatePreviewGlobalApi }).TemplatePreview = {
    mount,
    unmount,
  }
}

export { mount, unmount }
