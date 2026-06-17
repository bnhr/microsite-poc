/**
 * Story Player CMS Bundle
 *
 * Standalone bundle for embedding in CMS systems.
 * Bundles React and all dependencies into a single IIFE script.
 *
 * Usage in CMS:
 * ```html
 * <div id="story-player"></div>
 * <script src="story-player.min.js"></script>
 * <script>
 *   StoryPlayer.mount('story-player', {
 *     stories: [...],
 *     apiEndpoint: '/api/stories'
 *   })
 * </script>
 * ```
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StoryPlayer } from '../features/story-player/story-player'
import { stories as defaultStories } from '../data/stories'
import type { Story } from '../features/story-player/types'
import '../index.css'
import '../features/story-player/story-player.css'

interface MountConfig {
  stories?: Story[]
  loop?: boolean
  apiEndpoint?: string
}

type StoryPlayerGlobalApi = {
  mount: typeof mount
  unmount: typeof unmount
}

type ReactUnmountContainer = {
  _reactRootContainer?: {
    unmount: () => void
  }
}

/**
 * Mount the StoryPlayer component to a DOM element
 * @param elementId - ID of the element to mount to
 * @param config - Configuration options
 */
function mount(elementId: string, config: MountConfig = {}): void {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`)
    return
  }

  const { stories: customStories = defaultStories, loop = false } = config

  const root = createRoot(element)
  root.render(
    <StrictMode>
      <StoryPlayer stories={customStories} loop={loop} />
    </StrictMode>
  )
}

/**
 * Unmount the StoryPlayer component
 * @param elementId - ID of the mounted element
 */
function unmount(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`)
    return
  }

  const root = (element as ReactUnmountContainer)._reactRootContainer
  if (root) {
    root.unmount()
  }
}

// Export as global for IIFE builds
declare global {
  interface Window {
    StoryPlayer: {
      mount: typeof mount
      unmount: typeof unmount
    }
  }
}

// Expose to global scope for standalone script
if (typeof window !== 'undefined') {
  ;(window as Window & { StoryPlayer: StoryPlayerGlobalApi }).StoryPlayer = {
    mount,
    unmount,
  }
}

export { mount, unmount }
