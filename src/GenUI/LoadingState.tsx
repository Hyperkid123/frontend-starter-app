import React from 'react';
import { Variants, motion } from 'framer-motion';
import { CoreCircle, MiddleRing, OuterRing } from './RingComponents';
import './LoadingState.scss';

const LoadingState: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const spinnerVariants: Variants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <motion.div
      className="loading-state"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="loading-backdrop" />
      <div className="loading-content">
        <motion.div className="loading-icon" variants={itemVariants}>
          <OuterRing />
          <MiddleRing />
          <motion.div
            className="loading-spinner"
            variants={spinnerVariants}
            animate="spin"
          />
          <CoreCircle />
        </motion.div>

        <motion.div className="loading-text" variants={itemVariants}>
          <motion.h3 className="loading-title" variants={itemVariants}>
            Generating insights
          </motion.h3>
          <motion.div className="loading-dots" variants={itemVariants}>
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                delay: 0,
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                delay: 0.2,
              }}
            >
              .
            </motion.span>
            <motion.span
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                delay: 0.4,
              }}
            >
              .
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingState;
