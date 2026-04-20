import { ReactNode, memo } from 'react';
import type { Message } from '../../types';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  /** True if this is the currently streaming AI message */
  isStreaming: boolean;
}

/**
 * Safely parses basic Markdown without innerHTML.
 * Converts **bold** texts to <strong> elements and handles newlines.
 */
function parseMarkdown(text: string): ReactNode[] {
  // Split the string by bold **text** patterns OR newline characters
  const parts = text.split(/(\*\*.*?\*\*|\n)/g);
  
  return parts.map((part, i) => {
    if (part === '\n') return <br key={i} />;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      // Slice off the two asterisks on both sides
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
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
        aria-label={`${isUser ? 'Your message' : 'AI reply'}: ${message.content}`}
      >
        {parseMarkdown(message.content)}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
