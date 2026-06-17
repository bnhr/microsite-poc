# React Native WebView Snapshot Share (Compact)

## Scope
This doc is for React Native integration of the current PRD behavior: shareable pages produce a static image snapshot and open native share sheet.

Embed URL:
https://microsite-poc-kohl.vercel.app/

## PRD Behavior
1. On pages marked shareable, web shows Share button.
2. On tap, web generates static PNG snapshot of the current page.
3. Web normalizes snapshot ratio by target.
  - instagram_story -> 9:16
  - system, whatsapp, others -> 16:9
4. Web sends snapshot + metadata to native via WebView bridge.
5. Native opens iOS or Android share sheet.
6. Native returns share result back to web.

## Message From Web To Native
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

## Native Responsibilities
1. Listen to WebView onMessage.
2. Parse JSON safely.
3. Ignore unknown message types.
4. For type shareSnapshotRequest:
5. Decode imageDataUrl to binary.
6. Save temp PNG file.
7. Open native share sheet with image file.
8. Include text and url as message/caption when supported.
9. Send shareResult back to web.

Use preferredTarget only as a hint. Ratio is already enforced in web snapshot.

## Message From Native To Web
Success:
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

Failure or cancel:
```json
{
  "type": "shareResult",
  "payload": {
    "success": false,
    "target": "system",
    "errorCode": "user_cancelled"
  }
}
```

## Minimal React Native Flow
```tsx
import React, { useRef } from "react";
import { Share } from "react-native";
import { WebView } from "react-native-webview";

function parseDataUrl(input: string) {
  const match = input.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

export default function MicrositeScreen() {
  const webRef = useRef<WebView>(null);

  const postShareResult = (success: boolean, errorCode: string | null = null) => {
    webRef.current?.postMessage(
      JSON.stringify({
        type: "shareResult",
        payload: { success, target: "system", errorCode },
      }),
    );
  };

  const onMessage = async (event: { nativeEvent: { data: string } }) => {
    let body: any;
    try {
      body = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (body?.type !== "shareSnapshotRequest") {
      return;
    }

    const payload = body.payload;
    const parsed = parseDataUrl(payload.imageDataUrl);
    if (!parsed) {
      postShareResult(false, "share_failed");
      return;
    }

    try {
      // TODO: write base64 file to temp path with react-native-fs or expo-file-system
      // const localPath = await writeTempPng(parsed.base64, payload.fileName);

      const result = await Share.share({
        message: `${payload.text} ${payload.url}`,
        // url: `file://${localPath}`,
      });

      if (result.action === Share.dismissedAction) {
        postShareResult(false, "user_cancelled");
        return;
      }

      postShareResult(true, null);
    } catch {
      postShareResult(false, "share_failed");
    }
  };

  return (
    <WebView
      ref={webRef}
      source={{ uri: "https://microsite-poc-kohl.vercel.app/" }}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}
```

## QA Checklist
- Share button appears only on shareable slides.
- Tap Share opens native share sheet.
- Shared content contains snapshot image.
- For shareTarget=instagram_story, output is portrait.
- For shareTarget=system, output is landscape.
- Cancel returns success false with user_cancelled.
- Complete returns success true.
- Malformed bridge message does not crash.

## Debug URL Override
During QA, force ratio target from URL:
- https://microsite-poc-kohl.vercel.app/?shareTarget=instagram_story
- https://microsite-poc-kohl.vercel.app/?shareTarget=system
