import React, { PropsWithChildren, useEffect, useRef } from 'react';

import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import ComponentsContainer from './ComponentsContainer';
import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import stateManager from './ChatStateManager';
import Chat from './Chat';

import './Layout.scss';

const StateProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    stateManager.init();
  }, []);
  return (
    <AIStateProvider stateManager={stateManager}>{children}</AIStateProvider>
  );
};

const Layout: React.FC = () => {
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (layoutRef.current) {
        const rect = layoutRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 30;
        layoutRef.current.style.height = `${availableHeight}px`;
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div ref={layoutRef} className="layout-grid">
      <div className="components">
        <ComponentsContainer layoutRef={layoutRef} />
      </div>
      <div className="chat">
        <Chat />
      </div>
    </div>
  );
};

const ConnectedLayout = () => {
  return (
    <StateProvider>
      <Layout />
    </StateProvider>
  );
};

export default ConnectedLayout;
