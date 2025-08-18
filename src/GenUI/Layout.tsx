import React, { PropsWithChildren, useEffect, useRef } from 'react';

import { Grid, GridItem } from '@patternfly/react-core';
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
  return (
    <div ref={layoutRef} className="layout-grid">
      <Grid hasGutter>
        <GridItem span={6}>
          <Chat />
        </GridItem>
        <GridItem span={6}>
          <ComponentsContainer layoutRef={layoutRef} />
        </GridItem>
      </Grid>
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
