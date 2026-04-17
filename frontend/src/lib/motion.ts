// Shared Framer Motion helpers
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};
