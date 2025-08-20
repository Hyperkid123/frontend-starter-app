import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@patternfly/react-core';
import { AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import CustomMessageBar from './CustomMessageBar';

import '@patternfly/chatbot/dist/css/main.css';
import {
  useInProgress,
  useMessages,
  useSendMessage,
} from '@redhat-cloud-services/ai-react-state';
import { AdditionalAttributes } from './ChatStateManager';
import { Message as ChatMessage } from '@redhat-cloud-services/ai-client-state';
import { ChevronDownIcon, ChevronUpIcon } from '@patternfly/react-icons';

import './Chat.scss';

interface ChatProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hasMessages?: boolean;
}

// return (
//   <Chatbot displayMode={ChatbotDisplayMode.embedded}>
//     <ChatbotContent>
//       <MessageBox>
//         {textMessages.length === 0 && (
//           <ChatbotWelcomePrompt
//             title="How can I help today?"
//             description="I'm here to assist you with any questions or issues you may have."
//             className="pf-v6-u-mt-auto"
//           />
//         )}
//         {textMessages.map((message) => (
//           <Message
//             avatar="https://placehold.co/40"
//             key={message.id}
//             role={message.role}
//             content={message.answer}
//           />
//         ))}
//       </MessageBox>
//     </ChatbotContent>
//     <ChatbotFooter>
//       <MessageBar
//         isSendButtonDisabled={isInProgress}
//         hasAttachButton={false}
//         alwayShowSendButton
//         onSendMessage={onSendMessage}
//       />
//     </ChatbotFooter>
//   </Chatbot>
// );

const Chat: React.FC<ChatProps> = ({
  isExpanded = false,
  onToggleExpand,
  hasMessages: hasMessagesFromLayout,
}) => {
  const messages = useMessages<AdditionalAttributes>();
  const sendMessage = useSendMessage();
  const isInProgress = useInProgress();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const messageDisplayRef = React.useRef<HTMLDivElement>(null);

  const textMessages = useMemo(() => {
    return messages.reduce<ChatMessage[]>((acc, curr) => {
      if (curr.answer && curr.role === 'bot') {
        acc.push(curr);
      }
      return acc;
    }, []);
  }, [messages]);

  useEffect(() => {
    if (textMessages.length > 0) {
      setCurrentMessageIndex(textMessages.length - 1);
    }
  }, [textMessages.length]);

  function onSendMessage(message: string | number) {
    sendMessage(message.toString(), { stream: true });
  }

  const canGoPrev = currentMessageIndex > 0;
  const canGoNext = currentMessageIndex < textMessages.length - 1;

  const goToPrevious = () => {
    if (canGoPrev) {
      setCurrentMessageIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setCurrentMessageIndex((prev) => prev + 1);
    }
  };

  const hasMessages = textMessages.length > 0;

  // Calculate available width for text
  useEffect(() => {
    const calculateTextWidth = () => {
      if (messageDisplayRef.current) {
        const containerWidth = messageDisplayRef.current.getBoundingClientRect().width;
        // Account for padding (32px total), AI indicator (16px), gap (12px), and some buffer
        const availableWidth = containerWidth - 32 - 16 - 12 - 8;
        setTextWidth(Math.max(0, availableWidth));
      }
    };

    calculateTextWidth();
    window.addEventListener('resize', calculateTextWidth);
    return () => window.removeEventListener('resize', calculateTextWidth);
  }, [hasMessages, isExpanded]);

  return (
    <motion.div
      className={classNames('chat-container', {
        'has-messages': hasMessages,
        'empty-state': !hasMessages,
        expanded: isExpanded,
      })}
      layout
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >

      <AnimatePresence>
        {hasMessages && (
          <motion.div
            className="messages-messages-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="message-navigation-container">
              <Button
                variant="plain"
                className="nav-button nav-button-left"
                onClick={goToPrevious}
                isDisabled={!canGoPrev}
                icon={<AngleLeftIcon />}
              />
              <div className="message-display-area" ref={messageDisplayRef}>
                <div
                  className="carousel-container"
                  style={{
                    transform: `translateX(-${currentMessageIndex * 100}%)`,
                    transition: 'transform 0.3s ease-in-out',
                  }}
                >
                  {textMessages.map((message) => (
                    <div key={message.id} className="carousel-slide">
                      <div className="ai-response">
                        <div className="ai-indicator">
                          <div className="pulse-ring"></div>
                          <div className="ai-core"></div>
                        </div>
                        <div 
                          className="response-text"
                          style={{
                            width: textWidth > 0 ? `${textWidth}px` : 'auto',
                            maxWidth: textWidth > 0 ? `${textWidth}px` : 'none'
                          }}
                        >
                          {message.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="plain"
                className="nav-button nav-button-right"
                onClick={goToNext}
                isDisabled={!canGoNext}
                icon={<AngleRightIcon />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="message-bar-container"
        layout
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <CustomMessageBar
          onSendMessage={onSendMessage}
          isDisabled={isInProgress}
        />
      </motion.div>
    </motion.div>
  );
};

export default Chat;
