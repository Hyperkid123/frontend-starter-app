import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedCellProps {
  children: React.ReactNode;
  rowIndex: number;
  cellIndex: number;
  uniqueKey: string;
}

export const AnimatedCell: React.FC<AnimatedCellProps> = ({
  children,
  rowIndex,
  cellIndex,
  uniqueKey,
}) => {
  return (
    <motion.div
      key={uniqueKey}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: rowIndex * 0.1 + cellIndex * 0.05,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export interface AnimatedTableContainerProps {
  children: React.ReactNode;
  componentId: string;
}

export const AnimatedTableContainer: React.FC<AnimatedTableContainerProps> = ({
  children,
  componentId,
}) => {
  return <div key={componentId}>{children}</div>;
};

export const createAnimatedCell = (
  content: React.ReactNode,
  rowIndex: number,
  cellIndex: number,
  uniqueKey: string,
) => ({
  cell: (
    <AnimatedCell
      rowIndex={rowIndex}
      cellIndex={cellIndex}
      uniqueKey={uniqueKey}
    >
      {content}
    </AnimatedCell>
  ),
});
