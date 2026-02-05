import { atom } from "jotai";

export type Theme = "light" | "dark";
export type AnimationDirection = "left" | "right";

// Атом темы приложения
export const themeAtom = atom<Theme>("light");

// Атом направления анимации перехода страниц
export const animationDirectionAtom = atom<AnimationDirection>("right");
