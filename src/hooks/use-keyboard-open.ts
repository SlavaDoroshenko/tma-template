import { useEffect, useState } from "react";

// Порог определения клавиатуры: если viewport меньше 75% высоты экрана
const KEYBOARD_THRESHOLD = 0.75;

// Хук для определения открытой клавиатуры на мобильных устройствах
// Полезно для скрытия нижней навигации при вводе текста
export const useKeyboardOpen = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!window.visualViewport) return;

      const isOpen =
        window.visualViewport.height < window.innerHeight * KEYBOARD_THRESHOLD;
      setIsKeyboardOpen(isOpen);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return isKeyboardOpen;
};
