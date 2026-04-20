import { memo } from 'react';
import type { Message } from '../../types';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  /** True if this is the currently streaming AI message */
  isStreaming: boolean;
}

/**
 * MessageBubble — renders a single user or AI message.
 * Memoized to prevent re-rendering old messages while new ones stream.
 */
function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`${styles.msg} ${isUser ? styles.user : styles.ai}`}>
      <span className={styles.label}>{isUser ? 'You' : 'AI'}</span>
      
      <div 
        className={`${styles.bubble} ${isStreaming ? styles.streaming : ''}`}
        /* Accessibility: read out the whole message for non-streaming bubbles, 
           or let the live region handle the streaming text */
        aria-label={`${isUser ? 'Your message' : 'AI reply'}: ${message.content}`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
