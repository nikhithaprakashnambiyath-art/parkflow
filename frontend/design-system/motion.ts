export const motion = {
  transitions: {
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
    smooth: {
      type: 'tween',
      ease: [0.25, 1, 0.5, 1],
      duration: 0.6,
    },
    snappy: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scaleUp: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    }
  }
};
