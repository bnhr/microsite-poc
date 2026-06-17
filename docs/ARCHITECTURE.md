# Architecture Decision Record: Multi-Build vs. Dual-Project Approach

## Summary

**Decision**: Implement multi-build configuration (3 build modes) in a single project rather than maintaining 2 separate repositories.

**Status**: ✅ Recommended

**Last Updated**: 2026-06-17

---

## Context

The Story Player component needs to serve two different audiences:
1. **Microsite Team**: Build/host the standalone microsite
2. **CMS Team**: Embed the component in their CMS platform

Two approaches were considered:

### Option A: Single Project with Multiple Builds (CHOSEN)
One repository with build configurations that generate outputs for all use cases.

### Option B: Dual-Project Repository
Separate `microsite/` and `cms-integration/` projects, possibly sharing code via npm workspace or git submodule.

---

## Decision: Single Project Multi-Build

### Why This is Better ✨

#### 1. **Single Source of Truth**
- One copy of component code
- One set of story types/interfaces
- One design system
- No sync issues or duplicated logic

**Risk of Dual-Project:**
```
microsite/src/components/StoryPlayer.tsx
cms-project/src/components/StoryPlayer.tsx
# These diverge over time...
```

#### 2. **Type Safety Across Builds**
- All TypeScript definitions stay synchronized
- No version mismatches
- Story type changes propagate automatically

**Without**: CMS has old types, microsite has new types → broken at runtime

#### 3. **Simplified CI/CD**
- One workflow, three outputs
- Atomic releases (all versions match)
- Single test suite

**With Dual Projects:**
```
Test microsite (slow)
Test cms-project (slow)
Coordinate releases (error-prone)
```

#### 4. **Easier Maintenance**
- Bug fix in component → deployed everywhere immediately
- No cherry-picking between repos
- One ESLint/TypeScript config

#### 5. **Clear Build Outputs**

| Approach | Output |
|----------|--------|
| **Single** | `dist/` (SPA), `dist/` (lib), `dist/cms/` (standalone) |
| **Dual** | `microsite/dist/`, `cms-project/dist/` (plus coordination effort) |

#### 6. **Shared Utilities & Dependencies**
- DRY principle maintained
- Common styles/utilities in one place
- CSS Modules reuse

#### 7. **Performance**
- Build once, output multiple targets
- Shared TypeScript compilation
- No duplicate dependency installation

**Dual-project overhead:**
```
Node modules (duplicate):  
  node_modules/ (microsite)    → 500MB
  cms-project/node_modules/    → 500MB
                              ___________
  Total                        → 1GB
```

---

## Implementation Architecture

```
┌─ Project Root ─────────────────────────────┐
│                                            │
│  Source Code (Single)                     │
│  ├── src/features/story-player/           │
│  ├── src/data/stories.ts                  │
│  └── src/lib/                             │
│      ├── index.ts (library export)        │
│      └── cms-bundle.ts (standalone)       │
│                                            │
│  Build Configuration (Smart)              │
│  ├── vite.config.ts (3 modes)             │
│  ├── package.json (multi-exports)         │
│  └── scripts/                             │
│      └── generate-cms-exports.js          │
│                                            │
│  Outputs (Multiple)                       │
│  ├── dist/ (SPA + lib + types)            │
│  └── dist/cms/ (standalone + docs)        │
│                                            │
└────────────────────────────────────────────┘
```

### Three Build Modes

#### Mode 1: SPA (Default)
- **Trigger**: `bun run build`
- **Entry**: `index.html`
- **Output**: `dist/index.html` + assets
- **Use**: Direct hosting
- **Audience**: Microsite team

#### Mode 2: Library (ESM + UMD)
- **Trigger**: `VITE_BUILD_MODE=lib vite build`
- **Entry**: `src/lib/index.ts`
- **Output**: `.js` + `.umd.cjs` + `.css`
- **Use**: npm package or module import
- **Audience**: React projects, framework users

#### Mode 3: CMS (IIFE Standalone)
- **Trigger**: `VITE_BUILD_MODE=cms vite build`
- **Entry**: `src/lib/cms-bundle.ts`
- **Output**: `.min.js` + `.min.css` (bundled)
- **Use**: Script tag embedding
- **Audience**: CMS teams, non-React projects

---

## Comparison Matrix

| Criterion | Single Project | Dual Project |
|-----------|---|---|
| **Maintenance** | 1 codebase | 2 codebases |
| **Sync Issues** | None | Possible |
| **Type Safety** | Always sync | Manual sync |
| **Release Cycle** | Atomic | Coordinated |
| **Node Modules** | 500MB | 1GB+ |
| **CI/CD Setup** | 1 workflow | 2 workflows |
| **Testing** | Once | Twice |
| **Developer Onboarding** | Simple | Needs context |
| **Performance** | ⚡ Fast | Slower |
| **Complexity** | ~200 LoC config | ~2000 LoC total |

---

## Technical Details

### Entry Points Strategy

```typescript
// SPA: src/main.tsx
// └─ Mounts App to #root

// Library: src/lib/index.ts
// └─ Exports: StoryPlayer, useStoryPlayer, types
// └─ Users: import { StoryPlayer } from '@org/story-player'

// CMS: src/lib/cms-bundle.ts
// └─ Mounts: window.StoryPlayer.mount()
// └─ Users: <script src="story-player.min.js"></script>
```

### Package.json Exports Pattern

```json
{
  "exports": {
    ".": {
      "import": "./dist/story-player.js",
      "require": "./dist/story-player.umd.cjs",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/story-player.css",
    "./cms": {
      "script": "./dist/cms/story-player.min.js"
    }
  }
}
```

### Conditional Builds

Vite config intelligently switches based on environment:

```typescript
const isLibBuild = process.env.VITE_BUILD_MODE === 'lib'
const isCmsBuild = process.env.VITE_BUILD_MODE === 'cms'

export default defineConfig({
  build: isLibBuild ? {...} : isCmsBuild ? {...} : {...}
})
```

---

## Migration & Rollout Strategy

### Phase 1: Implementation (Now)
- ✅ Create multi-build vite.config.ts
- ✅ Set up entry points (lib/index.ts, lib/cms-bundle.ts)
- ✅ Update package.json exports
- ✅ Test all three build modes

### Phase 2: Validation
- Test SPA build → deploy to staging
- Test library build → publish to npm
- Test CMS build → integrate in test CMS

### Phase 3: Documentation
- Multi-build guide (MULTI_BUILD_GUIDE.md)
- CMS integration guide (dist/cms/integration-guide.html)
- Development workflow docs

### Phase 4: Team Communication
- Brief microsite team on new build system
- Guide CMS team to use CMS bundle
- Share type definitions with both teams

---

## What If We Still Need Separation Later?

If teams need operational independence later:

```typescript
// Easy split strategy:
// Keep one project, extract to separate:
// 1. microsite-frontend/ (uses npm package)
// 2. cms-frontend/ (uses CMS bundle)
// 3. story-player-core/ (library, published to npm)
```

**But**: This is premature optimization. Single project is simpler now.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|---|---|---|
| Teams need different deployment | Low | Medium | Multi-output handles this |
| Conflicting dependencies | Low | High | Peer deps + externals in lib |
| Build complexity | Low | Low | Clear vite.config.ts comments |
| Type mismatches | Low | High | Single tsconfig, shared types |

---

## Fallback Plans

### If Library Build Fails
→ Can revert to SPA only, publish compiled component

### If CMS Bundle Too Large
→ Can split React into separate script tag (advanced mode)

### If Teams Need Independence
→ Migrate to monorepo (nx/pnpm workspace) while keeping single codebase

---

## Decision Record

| Aspect | Decision |
|--------|----------|
| **Approach** | Single project, three build modes |
| **Rationale** | Simplicity, maintainability, single source of truth |
| **Entry Points** | SPA, lib/index.ts, lib/cms-bundle.ts |
| **Output Targets** | dist/, dist/ (with exports), dist/cms/ |
| **Deployment** | Each team uses appropriate build |
| **Review Date** | When teams report issues or needs change |

---

## References

- [Vite Library Mode](https://vite.dev/guide/build#library-mode)
- [Package Exports](https://nodejs.org/api/packages.html#packages_exports)
- [Multi-Build Guide](./MULTI_BUILD_GUIDE.md)
- [CMS Integration](../dist/cms/integration-guide.html)

---

**Recommended**: Proceed with multi-build single-project approach. This provides maximum flexibility with minimal maintenance overhead.
