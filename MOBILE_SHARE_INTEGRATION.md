# WebView Snapshot Share Integration Guide

## Overview
The microsite now uses snapshot-first sharing for mobile embedding.

Flow:
1. Share button appears only on slides marked shareable.
2. Web captures the current slide as PNG.
3. Web normalizes output ratio by target.
4. Web sends snapshot payload to React Native via WebView bridge.
5. Native opens iOS or Android share sheet.
6. Native posts result back to web.

## Domain
https://microsite-poc-kohl.vercel.app/

## Current Message Contract

### Web to Native: shareSnapshotRequest
```json
{
  "type": "shareSnapshotRequest",
  "payload": {
    "slideId": "top-10-aktif",
    "slideIndex": 2,
    "title": "Kilas Balik",
    "text": "Lihat kilas balik performa tokomu.",
    "url": "https://microsite-poc-kohl.vercel.app/",
    "preferredTarget": "system",
    "imageDataUrl": "data:image/png;base64,iVBORw0KGgoAAA...",
    "fileName": "top-10-aktif.png",
    "mimeType": "image/png"
  }
}
```

Payload fields:
- slideId: current slide id
- slideIndex: zero-based active index
- title: share title
- text: share text
- url: canonical URL
- preferredTarget: system, instagram_story, whatsapp, others
- imageDataUrl: PNG data URL from web snapshot
- fileName: suggested PNG filename
- mimeType: always image/png

### Native to Web: shareResult
```json
{
  "type": "shareResult",
  "payload": {
    "success": true,
    "target": "system",
    "errorCode": null
  }
}
```

Failure sample:
```json
{
  "type": "shareResult",
  "payload": {
    "success": false,
    "target": "instagram_story",
    "errorCode": "user_cancelled"
  }
}
```

## Ratio Rules Used by Web
- system: 16:9
- whatsapp: 16:9
- others: 16:9
- instagram_story: 9:16

Notes:
- Snapshot output is normalized to a fixed width with center crop to avoid device viewport bugs.
- For QA, web supports URL override using shareTarget query parameter.
  - shareTarget=instagram_story
  - shareTarget=system
  - shareTarget=whatsapp
  - shareTarget=others

## Native Implementation Checklist
1. Listen to WebView onMessage.
2. Parse JSON safely.
3. Ignore unknown message types.
4. On shareSnapshotRequest, decode imageDataUrl.
5. Write temporary PNG file.
6. Open native share sheet with image file and text/url when supported.
7. Return shareResult with success or errorCode.

## Recommended Error Codes
- user_cancelled
- app_not_installed
- share_failed
- unknown_error

## Web Fallback When Not Embedded
If ReactNativeWebView bridge is unavailable:
1. Web shares image file via navigator.share with files support.
2. If unavailable, web downloads PNG locally.

## QA Checklist
- Share button is visible only on shareable slides.
- shareSnapshotRequest payload includes imageDataUrl.
- Instagram target produces portrait output.
- Non-Instagram targets produce landscape output.
- Native share sheet opens with image.
- Native sends shareResult after success or cancel.
- Web handles malformed messages without crashing.
