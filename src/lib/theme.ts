import { Theme } from "@/data/atoms";

/**
 * Получить начальную тему из localStorage или системных настроек
 */
export const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem("app-theme") as Theme | null;
  const prefersDark =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return saved || (prefersDark ? "dark" : "light");
};

/**
 * Применить тему к документу
 */
export const applyTheme = (theme: Theme): void => {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem("app-theme", theme);
};
