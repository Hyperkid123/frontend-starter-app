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
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  useInProgress,
  useMessages,
} from '@redhat-cloud-services/ai-react-state';
import { AdditionalAttributes } from './ChatStateManager';
import { RegistryProps } from './api';
import { Message } from '@redhat-cloud-services/ai-client-state';

// const messages: Message<AdditionalAttributes>[] = [
//   {
//     answer: 'Baz',
//     date: new Date(),
//     id: '2',
//     role: 'bot',
//     additionalAttributes: {
//       contextId: '2',
//       components: [
//         {
//           scope: 'frontendStarterApp',
//           module: './ClusterVulnerabilityOverview',
//           componentId: '2',
//           contextId: '2',
//           props: {
//             issueLevels: ['high', 'critical'],
//           },
//         },
//       ],
//     },
//   },
//   {
//     answer: 'Foobar',
//     date: new Date(),
//     id: '1',
//     role: 'bot',
//     additionalAttributes: {
//       contextId: '1',
//       components: [
//         {
//           scope: 'frontendStarterApp',
//           module: './ClusterRecommendations',
//           componentId: '1',
//           contextId: '1',
//           props: {
//             clusterId: 'f0cc23f7-5dfa-440a-88f1-5a43e75b74d1',
//           },
//         },
//       ],
//     },
//   },
// ];

const ComponentsContainer = ({
  layoutRef,
}: {
  layoutRef: React.RefObject<HTMLDivElement>;
}) => {
  const messages = useMessages<AdditionalAttributes>();
  const isInProgress = useInProgress();

  const hasMessages = useMemo(
    () => messages.some((message) => message.answer && message.role === 'bot'),
    [messages],
  );

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

  const styles: CSSProperties = {
    height: '100%',
    overflow: 'scroll',
  };
  return (
    <div className="components-container" style={styles}>
      <AnimatePresence>{isInProgress && <LoadingState />}</AnimatePresence>
      <Stack hasGutter>
        {components?.length ? (
          components.map((component, index) => (
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
        ) : (
          <EmptyState />
        )}
      </Stack>
    </div>
  );
};

export default ComponentsContainer;
