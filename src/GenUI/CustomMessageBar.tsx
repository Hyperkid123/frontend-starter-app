import React, { useState } from 'react';
import { PaperPlaneIcon } from '@patternfly/react-icons';
import './CustomMessageBar.scss';

interface CustomMessageBarProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
}

const CustomMessageBar: React.FC<CustomMessageBarProps> = ({
  onSendMessage,
  isDisabled,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="custom-message-bar">
      <div className="message-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter AI command..."
          disabled={isDisabled}
          className="message-input"
        />
        <button
          type="submit"
          disabled={isDisabled || !message.trim()}
          className="send-button"
        >
          <PaperPlaneIcon />
        </button>
      </div>
    </form>
  );
};

export default CustomMessageBar;
