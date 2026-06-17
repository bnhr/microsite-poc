export type NativeShareTarget =
  | "system"
  | "instagram_story"
  | "whatsapp"
  | "others";

export type ShareChannel =
  | "native-requested"
  | "web-shared"
  | "web-image-shared"
  | "image-downloaded"
  | "copied-link"
  | "dismissed"
  | "unavailable";

export type ShareRequestPayload = {
  slideId: string;
  slideIndex: number;
  title: string;
  text: string;
  url: string;
  preferredTarget?: NativeShareTarget;
};

export type SnapshotShareRequestPayload = ShareRequestPayload & {
  imageDataUrl: string;
  fileName: string;
  mimeType: "image/png";
};

type NativeShareRequestMessage =
  | {
      type: "shareRequest";
      payload: ShareRequestPayload;
    }
  | {
      type: "shareSnapshotRequest";
      payload: SnapshotShareRequestPayload;
    };

export type NativeShareResult = {
  success: boolean;
  target?: string;
  errorCode?: string;
};

type NativeShareResultMessage = {
  type: "shareResult";
  payload?: NativeShareResult;
  success?: boolean;
  target?: string;
  errorCode?: string;
};

type NativeWebViewBridge = {
  postMessage: (message: string) => void;
};

declare global {
  interface Window {
    ReactNativeWebView?: NativeWebViewBridge;
  }
}

function parseNativeShareResultMessage(data: unknown): NativeShareResult | null {
  let messageData = data;

  if (typeof data === "string") {
    try {
      messageData = JSON.parse(data) as unknown;
    } catch {
      return null;
    }
  }

  if (!messageData || typeof messageData !== "object") {
    return null;
  }

  const message = messageData as NativeShareResultMessage;

  if (message.type !== "shareResult") {
    return null;
  }

  if (message.payload) {
    return message.payload;
  }

  return {
    success: Boolean(message.success),
    target: message.target,
    errorCode: message.errorCode,
  };
}

function sendNativeShareRequest(payload: ShareRequestPayload): boolean {
  const bridge = window.ReactNativeWebView;

  if (!bridge?.postMessage) {
    return false;
  }

  const message: NativeShareRequestMessage = {
    type: "shareRequest",
    payload,
  };

  bridge.postMessage(JSON.stringify(message));
  return true;
}

export function requestNativeSnapshotShare(
  payload: SnapshotShareRequestPayload,
): boolean {
  const bridge = window.ReactNativeWebView;

  if (!bridge?.postMessage) {
    return false;
  }

  const message: NativeShareRequestMessage = {
    type: "shareSnapshotRequest",
    payload,
  };

  bridge.postMessage(JSON.stringify(message));
  return true;
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((response) => response.blob());
}

function triggerDownload(dataUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

export async function shareSnapshotOnWeb(
  payload: SnapshotShareRequestPayload,
): Promise<ShareChannel> {
  try {
    const blob = await dataUrlToBlob(payload.imageDataUrl);
    const file = new File([blob], payload.fileName, { type: payload.mimeType });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: payload.title,
        text: payload.text,
      });
      return "web-image-shared";
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "dismissed";
    }
  }

  try {
    triggerDownload(payload.imageDataUrl, payload.fileName);
    return "image-downloaded";
  } catch {
    return "unavailable";
  }
}

export async function requestShare(payload: ShareRequestPayload): Promise<ShareChannel> {
  if (sendNativeShareRequest(payload)) {
    return "native-requested";
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return "web-shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "dismissed";
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload.url);
      return "copied-link";
    } catch {
      return "unavailable";
    }
  }

  return "unavailable";
}

export function subscribeToNativeShareResult(
  onResult: (result: NativeShareResult) => void,
): () => void {
  const handler = (event: Event) => {
    const messageEvent = event as MessageEvent<unknown>;
    const result = parseNativeShareResultMessage(messageEvent.data);

    if (result) {
      onResult(result);
    }
  };

  window.addEventListener("message", handler);
  document.addEventListener("message", handler);

  return () => {
    window.removeEventListener("message", handler);
    document.removeEventListener("message", handler);
  };
}
