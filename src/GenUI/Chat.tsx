import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@patternfly/react-core';
import { AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';
import CustomMessageBar from './CustomMessageBar';

import '@patternfly/chatbot/dist/css/main.css';
import {
  useInProgress,
  useMessages,
  useSendMessage,
} from '@redhat-cloud-services/ai-react-state';
import { AdditionalAttributes } from './ChatStateManager';
import { Message as ChatMessage } from '@redhat-cloud-services/ai-client-state';

import './Chat.scss';

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

const Chat = () => {
  const messages = useMessages<AdditionalAttributes>();
  const sendMessage = useSendMessage();
  const isInProgress = useInProgress();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

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

  return (
    <div className="chat-messages">
      <div className="messages-messages-container">
        {textMessages.length > 0 && (
          <div className="message-navigation-container">
            <Button
              variant="plain"
              className="nav-button nav-button-left"
              onClick={goToPrevious}
              isDisabled={!canGoPrev}
              icon={<AngleLeftIcon />}
            />
            <div className="message-display-area">
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
                      <div className="response-text">{message.answer}</div>
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
        )}
      </div>
      <div className="message-bar-container">
        <CustomMessageBar onSendMessage={onSendMessage} isDisabled={isInProgress} />
      </div>
    </div>
  );
};

export default Chat;
