import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { resolve } from 'node:path'

const isLibBuild = process.env.VITE_BUILD_MODE === 'lib'
const isCmsBuild = process.env.VITE_BUILD_MODE === 'cms'

// https://vite.dev/config/
export default defineConfig({
  define: isCmsBuild ? {
    'process.env.NODE_ENV': JSON.stringify('production'),
  } : undefined,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: isLibBuild ? {
    lib: {
      entry: resolve(import.meta.dirname, 'src/lib/index.ts'),
      name: 'StoryPlayer',
      formats: ['es', 'umd'],
      fileName: (format, entryName) => {
        const baseName = `${entryName}`
        if (format === 'es') {
          return `${baseName}.js`
        }
        return `${baseName}.umd.cjs`
      },
      cssFileName: 'story-player.css',
    },
    minify: 'oxc',
    sourcemap: true,
    rolldownOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  } : isCmsBuild ? {
    outDir: 'dist/cms',
    lib: {
      entry: resolve(import.meta.dirname, 'src/lib/cms-bundle.tsx'),
      name: 'StoryPlayer',
      formats: ['iife'],
      fileName: () => 'story-player.min.js',
      cssFileName: 'story-player.min',
    },
    minify: 'oxc',
    rolldownOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  } : {
    // Default: SPA build
    outDir: 'dist',
    minify: 'oxc',
  },
})
