/**
 * Story Player Library Export
 * 
 * This is the main entry point for library mode builds (ESM and UMD).
 * 
 * Usage:
 * ```ts
 * import { StoryPlayer } from '@your-org/story-player'
 * import '@your-org/story-player/style.css'
 * 
 * // In your React app
 * <StoryPlayer stories={stories} />
 * ```
 */

export { StoryPlayer } from '../features/story-player/story-player'
export { useStoryPlayer } from '../features/story-player/use-story-player'
export {
  requestShare,
  subscribeToNativeShareResult,
} from '../features/story-player/share-adapter'

// Export types for TypeScript users
export type { Story } from '../features/story-player/types'
export type {
  BaseStory,
  CoverStory,
  HeroStory,
  StatStory,
  RankingStory,
} from '../features/story-player/types'

// Export components for advanced use cases
export { StorySlide } from '../features/story-player/story-slide'
export { StoryPlayer as default } from '../features/story-player/story-player'
