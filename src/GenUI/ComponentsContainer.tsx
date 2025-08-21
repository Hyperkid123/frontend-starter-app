import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScalprumComponent } from '@scalprum/react-core';
import { AnimatePresence, motion } from 'framer-motion';
import RGLLayout, { Layout as LayoutType } from 'react-grid-layout';

import './ComponentsContainer.scss';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import {
  useInProgress,
  useMessages,
} from '@redhat-cloud-services/ai-react-state';
import { AdditionalAttributes } from './ChatStateManager';
import { RegistryProps } from './api';

import 'react-grid-layout/css/styles.css';

// Layout interfaces
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
const ComponentsContainer = ({}: {
  layoutRef: React.RefObject<HTMLDivElement>;
}) => {
  const messages = useMessages<AdditionalAttributes>();
  const isInProgress = useInProgress();
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple grid layout state
  const [gridLayout, setGridLayout] = useState<LayoutItem[]>([]);

  // Fixed width for demo
  const containerWidth = 1200;

  // Get all components from messages
  const allComponents = useMemo<RegistryProps[]>(() => {
    const result = messages
      .filter(
        (message) =>
          message.additionalAttributes?.components.length &&
          message.additionalAttributes?.components.length > 0,
      )
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .flatMap(({ additionalAttributes: { components } }) => components);
    result.reverse();
    return result;
  }, [messages]);

  // All components go to single grid
  const currentLayoutComponents = allComponents;

  // Add new components to grid
  useEffect(() => {
    const existingComponentIds = gridLayout.map((item) => item.i);
    const newComponents = allComponents.filter(
      (comp) => !existingComponentIds.includes(comp.componentId),
    );

    if (newComponents.length > 0) {
      // Create layout items for new components (full width at top)
      const newLayoutItems: LayoutItem[] = newComponents.map((comp, index) => ({
        i: comp.componentId,
        x: 0,
        y: index * 4, // Stack new components vertically at top
        w: 12, // Full width
        h: 4, // Default height
      }));

      // Shift existing items down
      const shiftedExistingItems = gridLayout.map((item) => ({
        ...item,
        y: item.y + newComponents.length * 4,
      }));

      setGridLayout([...newLayoutItems, ...shiftedExistingItems]);
    }
  }, [allComponents, gridLayout]);

  // Handle layout change (drag/resize)
  const handleLayoutChange = (newLayout: LayoutType[]) => {
    const updatedLayout = newLayout.map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));
    setGridLayout(updatedLayout);
  };

  const styles: CSSProperties = {
    height: '100%',
    overflow: 'auto',
  };

  return (
    <div
      className={`components-container ${currentLayoutComponents.length === 0 ? 'empty-state' : ''}`}
      style={styles}
      ref={containerRef}
    >
      <AnimatePresence>{isInProgress && <LoadingState />}</AnimatePresence>

      {/* Grid Layout */}
      {currentLayoutComponents.length > 0 ? (
        <RGLLayout
          draggableHandle=".drag-handle"
          className="layout"
          layout={gridLayout}
          cols={12}
          rowHeight={60}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          resizeHandles={['sw', 'nw', 'ne', 'se']}
          isDraggable={true}
          isResizable={true}
          onLayoutChange={handleLayoutChange}
          width={containerWidth}
        >
          {currentLayoutComponents.map((component, index) => (
            <div key={component.componentId} className={component.scope}>
              <div className="drag-handle" />
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                style={{ height: '100%', overflow: 'scroll' }}
              >
                <ScalprumComponent {...component.props} {...component} />
              </motion.div>
            </div>
          ))}
        </RGLLayout>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default ComponentsContainer;
