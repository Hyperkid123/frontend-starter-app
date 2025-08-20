import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { ChevronUpIcon, ChevronDownIcon } from '@patternfly/react-icons';

import { Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import ComponentsContainer from './ComponentsContainer';
import {
  AIStateProvider,
  useMessages,
} from '@redhat-cloud-services/ai-react-state';
import stateManager from './ChatStateManager';
import Chat from './Chat';
import { AdditionalAttributes } from './ChatStateManager';

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
  const messages = useMessages<AdditionalAttributes>();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMessages = useMemo(
    () => messages.some((message) => message.answer && message.role === 'bot'),
    [messages],
  );

  // Calculate dynamic heights and gaps
  const getChatHeight = () => {
    if (!hasMessages) return 87; // Fixed height for empty state (including padding)
    return isExpanded ? 500 : 200; // Expanded vs normal height
  };

  const getGapSize = () => {
    if (!hasMessages) return 0; // No gap in empty state
    // Calculate gap based on viewport size - responsive gap
    if (layoutRef.current) {
      const viewportHeight = window.innerHeight;
      return Math.max(12, Math.min(24, viewportHeight * 0.02)); // 12-24px gap based on screen size
    }
    return 16; // Default gap
  };

  const getGridStyle = () => {
    const chatHeight = getChatHeight();
    const gap = getGapSize();
    return {
      gridTemplateRows: `1fr ${chatHeight}px`,
      gap: `${gap}px`,
    };
  };

  const [, forceUpdate] = useState({});

  useEffect(() => {
    const updateLayout = () => {
      if (layoutRef.current) {
        const rect = layoutRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 30;
        layoutRef.current.style.height = `${availableHeight}px`;
        // Force re-render to recalculate gap size
        forceUpdate({});
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return (
    <div
      ref={layoutRef}
      className={classNames('layout-grid', {
        'has-messages': hasMessages,
        'empty-state': !hasMessages,
        expanded: isExpanded,
      })}
      style={getGridStyle()}
    >
      <div className="components">
        <ComponentsContainer layoutRef={layoutRef} />
      </div>
      <div className="chat">
        <Chat
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          hasMessages={hasMessages}
        />
      </div>
      
      {/* Resize button positioned at layout level */}
      {hasMessages && (
        <button
          className="layout-resize-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
        >
          {isExpanded ? (
            <ChevronDownIcon />
          ) : (
            <ChevronUpIcon />
          )}
        </button>
      )}
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
