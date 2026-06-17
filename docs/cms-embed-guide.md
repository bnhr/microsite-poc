# CMS Embed Guide

This guide explains how to use the standalone Story Player bundle in CMS platforms.

## 1. Build CMS Assets

Run:

```bash
bun run build:cms
```

You will get:

- `dist/cms/story-player.min.js`
- `dist/cms/story-player.css`

## 2. Add Assets to Your CMS

Upload/copy both files into your CMS asset location.

Example paths:

- `/assets/story-player.min.js`
- `/assets/story-player.css`

## 3. Add HTML Container

```html
<div id="story-player"></div>
```

## 4. Include CSS and JS

```html
<link rel="stylesheet" href="/assets/story-player.css" />
<script src="/assets/story-player.min.js"></script>
```

## 5. Initialize the Player

```html
<script>
  const stories = [
    {
      id: 'cover-1',
      type: 'cover',
      eyebrow: 'Kilas Balik',
      title: 'Perjalanan tokomu di 2026',
      subtitle: 'Lihat ringkasan performa dan aktivitas tokomu.',
      duration: 5000,
      background: 'linear-gradient(160deg, #0f2a7b, #081a50)',
      accent: '#f4a11a'
    }
  ]

  window.StoryPlayer.mount('story-player', {
    stories,
    loop: false
  })
</script>
```

## API

### `window.StoryPlayer.mount(elementId, config)`

Mounts the story player to a target element.

- `elementId`: string id of container element
- `config.stories`: array of story objects
- `config.loop`: boolean (optional)

### `window.StoryPlayer.unmount(elementId)`

Unmounts the story player from target element.

## Story Types

### Cover

```ts
{
  id: string
  type: 'cover'
  eyebrow: string
  title: string
  subtitle?: string
  duration: number
  background: string
  accent?: string
}
```

### Hero

```ts
{
  id: string
  type: 'hero'
  title: string
  description?: string
  duration: number
  background: string
  accent?: string
}
```

### Stat

```ts
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
```

### Ranking

```ts
{
  id: string
  type: 'ranking'
  title: string
  items: string[]
  duration: number
  background: string
  accent?: string
}
```

## Troubleshooting

### Player does not render

- Ensure container id matches `mount` argument.
- Ensure JS file is loaded before calling `mount`.
- Check browser console for errors.

### Styles missing

- Ensure `story-player.css` is included.
- Verify CSS path is correct.

### Multiple embeds on one page

Use unique element ids and call `mount` once per container.
