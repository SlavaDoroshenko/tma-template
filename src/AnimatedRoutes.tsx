import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { animationDirectionAtom } from "@/data/atoms";
import { routes } from "./routes";

const createPageVariants = (direction: "left" | "right") => ({
  initial: {
    opacity: 0,
    x: direction === "right" ? 50 : -50,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: direction === "right" ? -50 : 50,
  },
});

const pageTransition = {
  duration: 0.45,
  ease: [0.4, 0, 0.2, 1] as const,
};

const ANIMATION_DURATION_MS = pageTransition.duration * 1000; // 450ms

export default function AnimatedRoutes() {
  const location = useLocation();
  const animationDirection = useAtomValue(animationDirectionAtom);

  const scrollToTop = (type: "smooth" | "instant") => {
    const scrollContainer = document.querySelector(".overflow-y-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: type });
    }
  };

  const pageVariants = createPageVariants(animationDirection);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToTop("instant");
    }, ANIMATION_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location} key={location.pathname}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.component}
            />
          ))}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
