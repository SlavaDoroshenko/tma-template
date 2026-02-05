import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "./components/ui/sonner";
import AnimatedRoutes from "./AnimatedRoutes";
import "./index.css";

import Wrapper from "./Wrapper";

import { useAtom } from "jotai";
import { themeAtom } from "./data/atoms";
import { isTMA } from "./lib/utils";
import { getInitialTheme, applyTheme } from "./lib/theme";

const AppContent = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  // Инициализация темы из localStorage
  useEffect(() => {
    setTheme(getInitialTheme());
  }, [setTheme]);

  // Применение темы к документу
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Инициализация Telegram Mini App
  useEffect(() => {
    if (!window.Telegram) return;
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.disableVerticalSwipes();

    if (isTMA()) {
      try {
        window.Telegram.WebApp.lockOrientation();
        window.Telegram.WebApp.requestFullscreen();
      } catch {
        // Некоторые методы могут быть недоступны в старых версиях
      }
    }

    window.Telegram.WebApp.ready();
  }, []);

  // Синхронизация цветов Telegram с текущей темой
  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    const headerColor = theme === "dark" ? "#212121" : "#F5F5F5";
    const bgColor = theme === "dark" ? "#161616" : "#F5F5F5";

    window.Telegram.WebApp.setHeaderColor(headerColor);
    window.Telegram.WebApp.setBackgroundColor(bgColor);
  }, [theme]);

  return (
    <div className="font-sans">
      <div className="overflow-y-scroll overscroll-none fixed inset-0 z-50">
        <div className="relative font-sans">
          <Wrapper>
            <AnimatedRoutes />
          </Wrapper>
          <Toaster />
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
