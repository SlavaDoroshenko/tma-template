import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { animationDirectionAtom } from "@/data/atoms";
import { useSetAtom } from "jotai";

// Утилита для объединения CSS-классов (Tailwind + clsx)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Проверка: запущено ли приложение как Telegram Mini App
export function isTMA() {
  try {
    return !!window.Telegram?.WebView?.initParams?.tgWebAppData;
  } catch {
    return false;
  }
}

// Токен авторизации Telegram
export const tgToken = (() => {
  try {
    return window.Telegram?.WebView?.initParams?.tgWebAppData || "";
  } catch {
    return "";
  }
})();

// Определение платформы iOS
export const isIOS = (): boolean => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

// Тактильная обратная связь (haptic feedback) для Telegram
export const executeHaptic = () => {
  if (window.TelegramWebviewProxy) {
    // Здесь можно вызвать window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
};

// Форматирование даты в читаемый вид
export const formatDateToHuman = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    const formattedDate = date.toLocaleDateString("ru-RU", dateOptions);
    const formattedTime = date.toLocaleTimeString("ru-RU", timeOptions);

    return `${formattedDate} ${formattedTime}`;
  } catch {
    return isoDateString;
  }
};

// Форматирование даты без времени
export const formatDateToHumanNoTime = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("ru-RU", dateOptions);
  } catch {
    return isoDateString;
  }
};

// Форматирование только времени
export const formatTimeFromISO = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleTimeString("ru-RU", timeOptions);
  } catch {
    return isoDateString;
  }
};

// Хук дебаунса значения
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Хук навигации с направлением анимации
export const useDirectionalLink = () => {
  const navigate = useNavigate();
  const setAnimationDirection = useSetAtom(animationDirectionAtom);

  return (linkOrDelta: string | number, direction: "right" | "left") => {
    executeHaptic();
    setAnimationDirection(direction);
    setTimeout(() => {
      navigate(linkOrDelta as any);
    }, 0);
  };
};
