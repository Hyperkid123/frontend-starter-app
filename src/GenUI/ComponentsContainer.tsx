import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ScalprumComponent } from '@scalprum/react-core';
import { AnimatePresence, motion } from 'framer-motion';

import './ComponentsContainer.scss';
import {
  Bullseye,
  Icon,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  useInProgress,
  useMessages,
} from '@redhat-cloud-services/ai-react-state';
import { AdditionalAttributes } from './ChatStateManager';
import { RegistryProps } from './api';

const LoadingOverlay = () => {
  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <Bullseye>
        <Icon size="3xl" />
        <Spinner />
      </Bullseye>
    </motion.div>
  );
};

const ComponentsContainer = ({
  layoutRef,
}: {
  layoutRef: React.RefObject<HTMLDivElement>;
}) => {
  const messages = useMessages<AdditionalAttributes>();
  const isInProgress = useInProgress();
  const components = useMemo<RegistryProps[]>(() => {
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
  const [styles, setStyles] = useState<CSSProperties>({
    height: layoutRef.current?.getBoundingClientRect().height,
    overflow: 'scroll',
  });
  const setHeight = useCallback(() => {
    if (layoutRef.current) {
      setStyles((prev) => ({
        ...prev,
        height: layoutRef.current?.getBoundingClientRect().height,
      }));
    }
  }, []);
  useEffect(() => {
    setHeight();
  }, []);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setHeight();
    });
    if (layoutRef.current) {
      window.addEventListener('resize', setHeight);
      observer.observe(layoutRef.current, {
        attributes: true,
        childList: true,
        subtree: false,
      });
    }
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', setHeight);
    };
  }, [layoutRef]);
  return (
    <div className="components-container" style={styles}>
      <AnimatePresence>{isInProgress && <LoadingOverlay />}</AnimatePresence>
      <Stack hasGutter>
        {components?.length
          ? components.map((component, index) => (
              <StackItem key={component.componentId}>
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  <ScalprumComponent {...component.props} {...component} />
                </motion.div>
              </StackItem>
            ))
          : null}
      </Stack>
    </div>
  );
};

export default ComponentsContainer;
