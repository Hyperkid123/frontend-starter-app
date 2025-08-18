import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ScalprumComponent } from '@scalprum/react-core';

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
    <div className="loading-overlay">
      <Bullseye>
        <Icon size="3xl" />
        <Spinner />
      </Bullseye>
    </div>
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
      {isInProgress && <LoadingOverlay />}
      <Stack hasGutter>
        {components?.length
          ? components.map((component, index) => (
              <StackItem
                key={`${component.scope}-${component.module}-${index}`}
              >
                <ScalprumComponent {...component.props} {...component} />
              </StackItem>
            ))
          : null}
      </Stack>
    </div>
  );
};

export default ComponentsContainer;
