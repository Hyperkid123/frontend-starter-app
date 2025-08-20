import React from 'react';
import { Variants, motion } from 'framer-motion';
import { CoreCircle, MiddleRing, OuterRing } from './RingComponents';
import './EmptyState.scss';

const EmptyState: React.FC = () => {
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

  return (
    <motion.div
      className="empty-state"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="empty-state-content">
        <motion.div className="empty-state-icon" variants={itemVariants}>
          <OuterRing />
          <MiddleRing />
          <CoreCircle />
        </motion.div>

        <motion.div className="empty-state-text" variants={itemVariants}>
          <motion.h2 className="empty-state-title" variants={itemVariants}>
            Ready when you are
          </motion.h2>
        </motion.div>

        <motion.div className="empty-state-hint" variants={itemVariants}>
          <span>Ask me anything below</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmptyState;
