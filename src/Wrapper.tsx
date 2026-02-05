import React, { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { cn, isTMA, useDirectionalLink } from "@/lib/utils";

import {
  AnimationDirection,
  animationDirectionAtom,
} from "@/data/atoms";
import { useSetAtom } from "jotai";
import { useKeyboardOpen } from "@/hooks/use-keyboard-open";
import { Home, Search, User } from "lucide-react";

const TAB_ORDER = ["/", "/explore", "/profile"];
// Ограничение для предотвращения утечки памяти
const MAX_HISTORY_LENGTH = 10;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const setAnimationDirection = useSetAtom(animationDirectionAtom);
  const isKeyboardOpen = useKeyboardOpen();
  const navigationHistoryRef = useRef<string[]>([location.pathname]);

  const canGoBack = location.pathname !== "/" && navigationHistoryRef.current.length > 1;

  const getAnimationDirection = (targetPath: string): AnimationDirection => {
    const currentIndex = TAB_ORDER.indexOf(
      `/${location.pathname.split("/")[1]}`
    );
    const targetIndex = TAB_ORDER.indexOf(targetPath);

    if (currentIndex === -1 || targetIndex === -1) {
      return "right";
    }

    return targetIndex > currentIndex ? "right" : "left";
  };

  // Отслеживание истории навигации
  useEffect(() => {
    navigationHistoryRef.current.push(location.pathname);
    if (navigationHistoryRef.current.length > MAX_HISTORY_LENGTH) {
      navigationHistoryRef.current.shift();
    }
  }, [location.pathname]);

  // Обработка кнопки "назад" в Telegram
  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    window.Telegram.WebApp.onEvent("backButtonClicked", () => {
      const history = navigationHistoryRef.current;
      const previousPath =
        history.length >= 2 ? history[history.length - 2] : "/";

      const currentIndex = TAB_ORDER.indexOf(location.pathname);
      const previousIndex = TAB_ORDER.indexOf(previousPath);

      let direction: AnimationDirection = "left";

      if (currentIndex !== -1 && previousIndex !== -1) {
        direction = previousIndex > currentIndex ? "right" : "left";
      }

      flushSync(() => {
        setAnimationDirection(direction);
      });
      navigate(-1);
    });
  }, [navigate, setAnimationDirection, location.pathname]);

  // Показ/скрытие кнопки "назад" в Telegram
  useEffect(() => {
    if (!window.Telegram?.WebApp?.BackButton) return;

    if (canGoBack) {
      window.Telegram.WebApp.BackButton.show();
    } else {
      window.Telegram.WebApp.BackButton.hide();
    }
  }, [canGoBack]);

  return (
    <div
      className={cn(
        "flex overflow-visible relative flex-col flex-grow h-[100vh] scroll-smooth text-start",
        !isTMA() ? "" : "pt-20"
      )}
    >
      {/* Контент страницы */}
      <div
        className={cn(
          !isKeyboardOpen ? "pb-[calc(80px)]" : "pb-0",
          "pt-[20px]"
        )}
      >
        {children}
      </div>

      {/* Нижняя навигация */}
      {!isKeyboardOpen && (
        <div className="fixed bottom-0 left-0 z-50 w-full">
          <div className="max-w-[1280px] mx-auto px-4 pb-4">
            <div className="grid grid-cols-3 gap-x-0.5 justify-center items-center w-full rounded-3xl h-[60px] text-[9px] px-3 shadow-l bg-foreground">
              <NavElement
                icon={<Home className="w-5 h-5" />}
                title="Главная"
                link="/"
                active={location.pathname === "/"}
                direction={getAnimationDirection("/")}
              />
              <NavElement
                icon={<Search className="w-5 h-5" />}
                title="Обзор"
                link="/explore"
                active={location.pathname === "/explore"}
                direction={getAnimationDirection("/explore")}
              />
              <NavElement
                icon={<User className="w-5 h-5" />}
                title="Профиль"
                link="/profile"
                active={location.pathname === "/profile"}
                direction={getAnimationDirection("/profile")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wrapper;

const NavElement = ({
  icon,
  title,
  link,
  active,
  direction,
}: {
  icon: React.ReactNode;
  title: string;
  link: string;
  active: boolean;
  direction: AnimationDirection;
}) => {
  const navigateDirectional = useDirectionalLink();

  const handleClick = () => {
    navigateDirectional(link, direction);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <div
        className={cn(
          "grid relative auto-rows-max justify-center justify-items-center py-1 space-y-1 rounded-2xl",
          active ? "text-accent" : "text-subaccent"
        )}
      >
        <div className="grid justify-center h-max">{icon}</div>
        <div className="text-[10px]">{title}</div>
      </div>
    </div>
  );
};
