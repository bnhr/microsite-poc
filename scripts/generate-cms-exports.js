#!/usr/bin/env node
/**
 * Generate CMS Export Bundle
 * 
 * Creates a complete, ready-to-embed package for CMS systems including:
 * - Minified JS bundle with React
 * - Bundled CSS
 * - TypeScript definitions
 * - Usage documentation
 * - Integration examples
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = join(__dirname, '..')
const distDir = join(projectRoot, 'dist')
const cmsDir = join(distDir, 'cms')

console.log('📦 Generating CMS Export Bundle...\n')

try {
  // Ensure cms directory exists
  mkdirSync(cmsDir, { recursive: true })

  // 1. Generate HTML embedding guide
  const htmlGuide = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Story Player CMS Integration Guide</title>
  <link rel="stylesheet" href="story-player.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
    }
    code {
      font-family: 'Monaco', 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <h1>Story Player CMS Integration Guide</h1>
  
  <h2>Quick Start</h2>
  <p>Embed the Story Player in your CMS with just a few lines of code.</p>
  
  <h3>1. Add the Container</h3>
  <pre><code>&lt;div id="story-player"&gt;&lt;/div&gt;</code></pre>
  
  <h3>2. Include the Script</h3>
  <pre><code>&lt;script src="/path/to/story-player.min.js"&gt;&lt;/script&gt;
&lt;script src="/path/to/story-player.min.css"&gt;&lt;/script&gt;</code></pre>
  
  <h3>3. Initialize</h3>
  <pre><code>&lt;script&gt;
  StoryPlayer.mount('story-player', {
    stories: [
      {
        id: 'cover-1',
        type: 'cover',
        eyebrow: 'Welcome',
        title: 'Your Title',
        duration: 5000,
        background: 'linear-gradient(...)',
        accent: '#f4a11a'
      }
    ],
    loop: false
  })
&lt;/script&gt;</code></pre>
  
  <h2>Story Types</h2>
  
  <h3>Cover Story</h3>
  <pre><code>{
  id: string
  type: 'cover'
  eyebrow: string
  title: string
  subtitle?: string
  duration: number
  background: string
  accent?: string
}</code></pre>
  
  <h3>Hero Story</h3>
  <pre><code>{
  id: string
  type: 'hero'
  title: string
  description?: string
  duration: number
  background: string
  accent?: string
}</code></pre>
  
  <h3>Stat Story</h3>
  <pre><code>{
  id: string
  type: 'stat'
  label: string
  value: string
  note?: string
  duration: number
  background: string
  accent?: string
}</code></pre>
  
  <h3>Ranking Story</h3>
  <pre><code>{
  id: string
  type: 'ranking'
  title: string
  items: string[]
  duration: number
  background: string
  accent?: string
}</code></pre>
  
  <h2>API</h2>
  
  <h3>mount(elementId, config)</h3>
  <p>Mount the Story Player to a DOM element.</p>
  
  <h3>unmount(elementId)</h3>
  <p>Unmount the Story Player from a DOM element.</p>
  
  <h2>Styling</h2>
  <p>Include the CSS file before using the component:</p>
  <pre><code>&lt;link rel="stylesheet" href="/path/to/story-player.min.css"&gt;</code></pre>
  
  <h2>Browser Support</h2>
  <ul>
    <li>Chrome 111+</li>
    <li>Firefox 114+</li>
    <li>Safari 16.4+</li>
    <li>Edge 111+</li>
  </ul>
  
  <h2>Performance</h2>
  <p>The bundle is optimized and minified:</p>
  <ul>
    <li>JS: ~${getFileSize('story-player.min.js')} kB (gzipped)</li>
    <li>CSS: ~${getFileSize('story-player.min.css')} kB (gzipped)</li>
  </ul>
  
  <div id="story-player"></div>
  
  <script src="story-player.min.js"><\/script>
  <script>
    // Example: Mount with sample stories
    StoryPlayer.mount('story-player', {
      stories: [
        {
          id: 'demo-cover',
          type: 'cover',
          eyebrow: 'Demo',
          title: 'Welcome to Story Player',
          subtitle: 'This is an example story player',
          duration: 5000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          accent: '#fbbf24'
        }
      ]
    })
  <\/script>
</body>
</html>`

  writeFileSync(join(cmsDir, 'integration-guide.html'), htmlGuide)
  console.log('✅ Generated integration-guide.html')

  // 2. Generate TypeScript definitions
  const tsDefinitions = `/**
 * @my-org/story-player - CMS Bundle Type Definitions
 */

export interface BaseStory {
  id: string
  duration: number
  background: string
  accent?: string
}

export interface CoverStory extends BaseStory {
  type: 'cover'
  eyebrow: string
  title: string
  subtitle?: string
}

export interface HeroStory extends BaseStory {
  type: 'hero'
  title: string
  description?: string
}

export interface StatStory extends BaseStory {
  type: 'stat'
  label: string
  value: string
  note?: string
}

export interface RankingStory extends BaseStory {
  type: 'ranking'
  title: string
  items: string[]
}

export type Story = CoverStory | HeroStory | StatStory | RankingStory

export interface MountConfig {
  stories?: Story[]
  loop?: boolean
  apiEndpoint?: string
}

export interface StoryPlayerAPI {
  /**
   * Mount the Story Player to a DOM element
   * @param elementId - ID of the element to mount to
   * @param config - Configuration options
   */
  mount(elementId: string, config?: MountConfig): void

  /**
   * Unmount the Story Player from a DOM element
   * @param elementId - ID of the mounted element
   */
  unmount(elementId: string): void
}

declare global {
  interface Window {
    StoryPlayer: StoryPlayerAPI
  }
}

export {}
`

  writeFileSync(join(cmsDir, 'cms-bundle.d.ts'), tsDefinitions)
  console.log('✅ Generated cms-bundle.d.ts')

  // 3. Generate README
  const readmeContent = `# Story Player - CMS Bundle

Complete, standalone Story Player bundle for embedding in any CMS.

## Files Included

- \`story-player.min.js\` - Minified standalone bundle (~${getFileSize('story-player.min.js')} kB gzipped)
- \`story-player.min.css\` - Minified styles (~${getFileSize('story-player.min.css')} kB gzipped)
- \`cms-bundle.d.ts\` - TypeScript definitions
- \`integration-guide.html\` - Complete integration guide with examples

## Quick Start

\`\`\`html
<!-- Include styles -->
<link rel="stylesheet" href="path/to/story-player.min.css">

<!-- Container -->
<div id="story-player"></div>

<!-- Include script -->
<script src="path/to/story-player.min.js"></script>

<!-- Initialize -->
<script>
  StoryPlayer.mount('story-player', {
    stories: [{
      id: 'cover-1',
      type: 'cover',
      eyebrow: 'Welcome',
      title: 'Your Story Title',
      duration: 5000,
      background: 'linear-gradient(...)',
      accent: '#f4a11a'
    }]
  })
</script>
\`\`\`

## Story Types

### Cover Story
\`\`\`typescript
{
  id: string
  type: 'cover'
  eyebrow: string
  title: string
  subtitle?: string
  duration: number          // milliseconds
  background: string        // CSS gradient or color
  accent?: string           // optional accent color
}
\`\`\`

### Hero Story
\`\`\`typescript
{
  id: string
  type: 'hero'
  title: string
  description?: string
  duration: number
  background: string
  accent?: string
}
\`\`\`

### Stat Story
\`\`\`typescript
{
  id: string
  type: 'stat'
  label: string
  value: string
  note?: string
  duration: number
  background: string
  accent?: string
}
\`\`\`

### Ranking Story
\`\`\`typescript
{
  id: string
  type: 'ranking'
  title: string
  items: string[]
  duration: number
  background: string
  accent?: string
}
\`\`\`

## API

### \`StoryPlayer.mount(elementId, config)\`

Mount the Story Player to a DOM element.

**Parameters:**
- \`elementId\` (string): ID of the container element
- \`config\` (MountConfig): Optional configuration
  - \`stories\` (Story[]): Array of story objects
  - \`loop\` (boolean): Loop through stories (default: false)
  - \`apiEndpoint\` (string): Optional API endpoint for dynamic stories

**Example:**
\`\`\`javascript
StoryPlayer.mount('story-player', {
  stories: myStories,
  loop: true
})
\`\`\`

### \`StoryPlayer.unmount(elementId)\`

Unmount the Story Player from a DOM element.

**Parameters:**
- \`elementId\` (string): ID of the mounted element

**Example:**
\`\`\`javascript
StoryPlayer.unmount('story-player')
\`\`\`

## Integration Examples

### WordPress

Add to your theme's template:

\`\`\`php
<!-- In your theme template -->
<div id="story-player"></div>

<link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/story-player/story-player.min.css">
<script src="<?php echo get_template_directory_uri(); ?>/story-player/story-player.min.js"></script>

<script>
  const stories = <?php echo json_encode(\$wp_query->posts); ?>;
  StoryPlayer.mount('story-player', { stories });
</script>
\`\`\`

### Shopify Liquid

\`\`\`liquid
<link rel="stylesheet" href="{{ 'story-player.min.css' | asset_url }}">
<div id="story-player"></div>
<script src="{{ 'story-player.min.js' | asset_url }}"></script>

<script>
  const stories = {{ section.settings.stories | json }};
  StoryPlayer.mount('story-player', { stories });
</script>
\`\`\`

### Static HTML

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="story-player.min.css">
</head>
<body>
  <div id="story-player"></div>
  
  <script src="story-player.min.js"></script>
  <script>
    const stories = [
      {
        id: 'story-1',
        type: 'cover',
        eyebrow: 'Story 1',
        title: 'Hello World',
        duration: 5000,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accent: '#fbbf24'
      }
    ];
    
    StoryPlayer.mount('story-player', { stories, loop: true });
  </script>
</body>
</html>
\`\`\`

## Styling

The component uses CSS Modules internally and provides a clean default style. You can customize:

- Background gradients via story objects
- Accent colors via story \`accent\` property
- Duration via story \`duration\` property

## Browser Support

- Chrome 111+
- Firefox 114+
- Safari 16.4+
- Edge 111+

## Size

- JS: ~${getFileSize('story-player.min.js')} kB (gzipped)
- CSS: ~${getFileSize('story-player.min.css')} kB (gzipped)

## License

MIT

## Support

For issues or questions, please refer to the main repository or integration guide.
`

  writeFileSync(join(cmsDir, 'README.md'), readmeContent)
  console.log('✅ Generated README.md')

  // 4. Generate package info
  const packageInfo = {
    name: '@your-org/story-player-cms',
    version: '0.0.0',
    description: 'Standalone Story Player bundle for CMS integration',
    type: 'module',
    files: ['story-player.min.js', 'story-player.min.css', 'cms-bundle.d.ts'],
    exports: {
      '.': {
        script: './story-player.min.js',
        types: './cms-bundle.d.ts',
      },
      './css': './story-player.min.css',
    },
  }

  writeFileSync(join(cmsDir, 'package.json'), JSON.stringify(packageInfo, null, 2))
  console.log('✅ Generated package.json')

  console.log('\n📋 CMS Export Bundle Summary:')
  console.log(`   Location: ${cmsDir}`)
  console.log('   Files:')
  console.log('   ├── story-player.min.js (standalone bundle)')
  console.log('   ├── story-player.min.css (styles)')
  console.log('   ├── cms-bundle.d.ts (TypeScript definitions)')
  console.log('   ├── integration-guide.html (web guide)')
  console.log('   ├── README.md (documentation)')
  console.log('   └── package.json (package info)')
  console.log('\n✨ Ready for CMS integration!')
} catch (error) {
  console.error('❌ Error generating CMS bundle:', error)
  process.exit(1)
}

function getFileSize(filename) {
  try {
    const filePath = join(cmsDir, filename)
    const stats = require('node:fs').statSync(filePath)
    const kB = (stats.size / 1024).toFixed(1)
    return kB
  } catch {
    return '?'
  }
}
