export type NativeShareTarget =
  | "system"
  | "instagram_story"
  | "whatsapp"
  | "others";

export type ShareChannel =
  | "native-requested"
  | "web-shared"
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

type NativeShareRequestMessage = {
  type: "shareRequest";
  payload: ShareRequestPayload;
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
