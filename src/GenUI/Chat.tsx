import React, { useMemo } from 'react';
import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from '@patternfly/chatbot';

import '@patternfly/chatbot/dist/css/main.css';
import {
  useInProgress,
  useMessages,
  useSendMessage,
} from '@redhat-cloud-services/ai-react-state';
import { AdditionalAttributes } from './ChatStateManager';
import { Message as ChatMessage } from '@redhat-cloud-services/ai-client-state';

const Chat = () => {
  const messages = useMessages<AdditionalAttributes>();
  const sendMessage = useSendMessage();
  const isInProgress = useInProgress();
  const textMessages = useMemo(() => {
    return messages.reduce<ChatMessage[]>((acc, curr) => {
      if (curr.answer) {
        acc.push(curr);
      }
      return acc;
    }, []);
  }, [messages]);
  function onSendMessage(message: string | number) {
    sendMessage(message.toString(), { stream: true });
  }
  return (
    <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <ChatbotContent>
        <MessageBox>
          {textMessages.length === 0 && (
            <ChatbotWelcomePrompt
              title="How can I help today?"
              description="I'm here to assist you with any questions or issues you may have."
              className="pf-v6-u-mt-auto"
            />
          )}
          {textMessages.map((message) => (
            <Message
              avatar="https://placehold.co/40"
              key={message.id}
              role={message.role}
              content={message.answer}
            />
          ))}
        </MessageBox>
      </ChatbotContent>
      <ChatbotFooter>
        <MessageBar
          isSendButtonDisabled={isInProgress}
          hasAttachButton={false}
          alwayShowSendButton
          onSendMessage={onSendMessage}
        />
      </ChatbotFooter>
    </Chatbot>
  );
};

export default Chat;
