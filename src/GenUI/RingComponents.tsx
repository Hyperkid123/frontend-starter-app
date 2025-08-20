import React from 'react';
import { motion, Variants } from 'framer-motion';

const outerRingVariants: Variants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

const middleRingVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
      delay: 0.3,
    },
  },
};

const coreVariants: Variants = {
  glow: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
      '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3), 0 0 80px rgba(59, 130, 246, 0.15)',
      '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
    ],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

export const OuterRing: React.FC<{ className?: string }> = ({ className = "outer-ring" }) => (
  <motion.div
    className={className}
    variants={outerRingVariants}
    animate="pulse"
  />
);

export const MiddleRing: React.FC<{ className?: string }> = ({ className = "middle-ring" }) => (
  <motion.div
    className={className}
    variants={middleRingVariants}
    animate="pulse"
  />
);

export const CoreCircle: React.FC<{ className?: string }> = ({ className = "core-circle" }) => (
  <motion.div 
    className={className}
    variants={coreVariants}
    animate="glow"
  />
);