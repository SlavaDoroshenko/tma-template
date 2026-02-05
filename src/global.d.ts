interface TelegramWebApp {
  expand: () => void;
  ready: () => void;
  close: () => void;
  disableVerticalSwipes: () => void;
  lockOrientation: () => void;
  requestFullscreen: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

interface TelegramWebView {
  initParams?: {
    tgWebAppData?: string;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
    WebView?: TelegramWebView;
  };
  TelegramWebviewProxy?: unknown;
}
