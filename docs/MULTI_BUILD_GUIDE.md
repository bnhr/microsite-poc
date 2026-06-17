# Multi-Build Configuration Guide

This document explains the three build modes available for the Story Player project.

## Overview

The Story Player supports three distinct build configurations to accommodate different use cases:

```
┌─────────────────────────────────────────────────────────────┐
│                    Story Player Project                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. SPA Build (Default)                                      │
│     └─ Full React app for standalone microsite              │
│     └─ Contains all dependencies + dev tools                │
│     └─ Output: dist/index.html + assets                     │
│                                                               │
│  2. Library Build (ESM + UMD)                               │
│     └─ Reusable component package                           │
│     └─ External React dependency                            │
│     └─ Output: dist/story-player.js + .umd.cjs             │
│                                                               │
│  3. CMS Bundle (Standalone IIFE)                            │
│     └─ Single self-contained script                         │
│     └─ Bundles React + all dependencies                     │
│     └─ Output: dist/cms/story-player.min.js                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Build Commands

### 1. Default SPA Build
```bash
bun run build
# or
npm run build
```

**Output:**
- `dist/index.html` - Main HTML file
- `dist/assets/` - Optimized JS, CSS, images
- Perfect for: Direct hosting, Vercel, Netlify, static servers

**Package.json exports:**
- Published as: `main` entry (default imports)

---

### 2. Library Build (ESM + UMD)
```bash
bun run build:lib
# or 
npm run build:lib
```

**Output:**
- `dist/story-player.js` - ES Module format
- `dist/story-player.umd.cjs` - CommonJS/UMD format
- `dist/story-player.css` - Extracted styles
- `dist/index.d.ts` - TypeScript definitions

**Package.json exports:**
```json
{
  "exports": {
    ".": {
      "import": "./dist/story-player.js",
      "require": "./dist/story-player.umd.cjs",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/story-player.css"
  }
}
```

**Usage in Projects:**
```typescript
// Option 1: ES Module (modern)
import { StoryPlayer } from '@your-org/story-player'
import '@your-org/story-player/style.css'

// Option 2: CommonJS (Node.js)
const { StoryPlayer } = require('@your-org/story-player')

// Option 3: UMD (global)
<script src="https://cdn.example.com/story-player.umd.cjs"></script>
<script>
  const { StoryPlayer } = window.StoryPlayer
</script>
```

**Perfect for:**
- npm package distribution
- NextJS, React, Vue, Svelte projects
- Projects with their own React installation

---

### 3. CMS Bundle Build
```bash
bun run build:cms
# or
npm run build:cms
```

**Output:**
- `dist/cms/story-player.min.js` - Standalone bundle (~250KB gzipped)
- `dist/cms/story-player.min.css` - Styles (~15KB gzipped)
- `dist/cms/cms-bundle.d.ts` - TypeScript definitions
- `dist/cms/integration-guide.html` - Interactive guide
- `dist/cms/README.md` - Complete documentation

**Global API:**
```javascript
// Mount to a DOM element
StoryPlayer.mount('story-player', {
  stories: [{
    id: 'story-1',
    type: 'cover',
    title: 'My Story',
    duration: 5000,
    background: 'linear-gradient(...)'
  }]
})

// Unmount when done
StoryPlayer.unmount('story-player')
```

**Perfect for:**
- WordPress / PHP CMS
- Shopify / e-commerce platforms
- Static CMS (Contentful, Strapi, etc.)
- No build step required
- Script tag integration

---

## Build All Targets

```bash
bun run build:all
# Runs: build → build:lib → build:cms sequentially
```

---

## Configuration Details

### Vite Config (`vite.config.ts`)

The config uses `VITE_BUILD_MODE` environment variable to switch builds:

```typescript
const isLibBuild = process.env.VITE_BUILD_MODE === 'lib'
const isCmsBuild = process.env.VITE_BUILD_MODE === 'cms'

export default defineConfig({
  // ... common plugins
  build: isLibBuild ? {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'StoryPlayer',
      formats: ['es', 'umd'],
      fileName: (format) => `story-player.${format}.js`,
      cssFileName: 'story-player.css',
    },
    rolldownOptions: {
      external: ['react', 'react-dom'],  // Don't bundle React
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  } : isCmsBuild ? {
    lib: {
      entry: 'src/lib/cms-bundle.ts',
      formats: ['iife'],  // Single IIFE bundle
      fileName: () => 'story-player.min.js',
    },
    rolldownOptions: {
      output: {
        inlineDynamicImports: true,  // Bundle everything
      },
    },
  } : {
    // Default SPA build
    outDir: 'dist',
  },
})
```

### Entry Points

#### SPA Build
- Entry: `index.html` (standard Vite default)
- Output: Full HTML app

#### Library Build
- Entry: `src/lib/index.ts`
- Exports: Components, hooks, types
- Externals: React, React-DOM (peer dependencies)

#### CMS Build
- Entry: `src/lib/cms-bundle.ts`
- Exports: Global `window.StoryPlayer` API
- Bundles: Everything including React

---

## File Structure

```
project/
├── src/
│   ├── lib/
│   │   ├── index.ts                    # Library exports (ESM/UMD)
│   │   └── cms-bundle.ts               # Standalone bundle (IIFE)
│   ├── features/story-player/
│   │   ├── story-player.tsx            # Main component
│   │   ├── story-slide.tsx
│   │   ├── types.ts                    # Shared types
│   │   └── ...
│   └── app.tsx
│
├── scripts/
│   └── generate-cms-exports.js         # Generate CMS docs/guide
│
├── dist/
│   ├── index.html                      # SPA build
│   ├── assets/                         # SPA assets
│   ├── story-player.js                 # Library ESM
│   ├── story-player.umd.cjs            # Library UMD
│   ├── story-player.css                # Library CSS
│   └── cms/
│       ├── story-player.min.js         # CMS standalone
│       ├── story-player.min.css        # CMS CSS
│       ├── cms-bundle.d.ts             # TypeScript defs
│       ├── integration-guide.html      # Web guide
│       ├── README.md                   # CMS docs
│       └── package.json                # CMS package info
│
├── vite.config.ts                      # Multi-mode config
├── package.json                        # Scripts & exports
└── tsconfig.json
```

---

## Usage Scenarios

### Scenario 1: Standalone Microsite
```bash
bun run build
# Deploy dist/ to any static host
```

### Scenario 2: npm Package
```bash
bun run build:lib
# Publish to npm/private registry
# Users install: npm install @your-org/story-player
```

### Scenario 3: CMS Integration
```bash
bun run build:cms
# Upload dist/cms/ files to CMS
# Include in pages via <script> and <link> tags
```

### Scenario 4: All Three
```bash
bun run build:all
# Generate all outputs
# dist/        - for hosting
# dist/ (lib)  - for npm
# dist/cms/    - for CMS integration
```

---

## Publishing

### NPM Package
```bash
# Build library version
bun run build:lib

# Update version in package.json
npm version patch

# Publish
npm publish
```

### CMS Distribution
```bash
# Build CMS bundle
bun run build:cms

# Generate documentation
node scripts/generate-cms-exports.js

# Package dist/cms/ files for distribution
```

---

## Dependencies vs. Bundling

### Library Build (ESM/UMD)
- ❌ Does NOT bundle React
- ✅ Smaller bundle (~50KB)
- ⚠️ Requires peer dependency: React 18+
- 🎯 Use when: Adding to existing React app

### CMS Build (IIFE)
- ✅ Bundles React + all deps
- ⚠️ Larger bundle (~250KB gzipped)
- ✅ No dependencies needed
- 🎯 Use when: Standalone/CMS use

---

## Performance Optimizations

### Build Settings
- **Minifier**: Oxc (30-90x faster than Terser)
- **Code Splitting**: Disabled for library (single file)
- **CSS**: Bundled separately, imported explicitly
- **Tree-shaking**: Enabled for library build

### Bundle Sizes (Estimated)
| Build | Size | Gzipped |
|-------|------|---------|
| SPA | 850KB | 280KB |
| Library (ESM) | 45KB | 15KB |
| Library (UMD) | 65KB | 22KB |
| CMS (IIFE) | 850KB | 250KB |

---

## Troubleshooting

### Library build fails with React error
**Cause**: React is bundled when it shouldn't be  
**Fix**: Ensure `VITE_BUILD_MODE=lib` is set and `external: ['react']` in config

### CMS script tag not found in global
**Cause**: Standalone bundle not properly exposed  
**Fix**: Check `src/lib/cms-bundle.ts` exports to `window.StoryPlayer`

### CSS not loading in library build
**Fix**: Ensure user imports:
```typescript
import '@your-org/story-player/style.css'
```

### Build outputs to wrong directory
**Cause**: `outDir` not specified correctly  
**Fix**: Check `build.outDir` in `vite.config.ts` for each mode

---

## Next Steps

1. **Test all builds**:
   ```bash
   bun run build:all
   ```

2. **Verify outputs**:
   ```bash
   ls -la dist/
   ls -la dist/cms/
   ```

3. **Deploy SPA**:
   ```bash
   # To Vercel, Netlify, or static host
   vercel deploy dist/
   ```

4. **Publish Library**:
   ```bash
   npm publish
   ```

5. **Integrate CMS**:
   ```bash
   # Copy dist/cms/ to CMS assets
   # Follow integration-guide.html
   ```

---

## Resources

- [Vite Library Mode Docs](https://vite.dev/guide/build#library-mode)
- [Rollup Output Formats](https://rollupjs.org/guide/en/#output-format)
- [Package.json Exports](https://nodejs.org/api/packages.html#packages_exports)
