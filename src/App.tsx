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

const AppContent = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  // Инициализация темы из localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as
      | "light"
      | "dark"
      | null;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, [setTheme]);

  // Применение темы к документу
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("app-theme", theme);
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

    window.Telegram.WebApp.setHeaderColor("#212121");
    window.Telegram.WebApp.setBackgroundColor("#212121");
    window.Telegram.WebApp.ready();
  }, []);

  return (
    <div className="font-sans">
      <div className="invisible h-[150vh]" />
      <div className="overflow-y-scroll fixed inset-0 z-50">
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
