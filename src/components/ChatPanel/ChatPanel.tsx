import { useState, useRef, useEffect } from 'react';
import type { Message, ChatStatus } from '../../types';
import MessageBubble from './MessageBubble';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  messages: Message[];
  status: ChatStatus;
  onSendMessage: (msg: string) => void;
}

/**
 * ChatPanel — Handles conversation history and user input.
 * Auto-scrolls to the bottom on new messages.
 */
export default function ChatPanel({ messages, status, onSendMessage }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputDisabled = status !== 'idle';

  // Auto-scroll to bottom whenever messages or status changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || inputDisabled) return;
    
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <section className={styles.panel} aria-labelledby="chat-heading">
      <header className={styles.header}>
        <h2 id="chat-heading" className={styles.title}>
          Assistant Chat
        </h2>
      </header>

      <div 
        className={styles.messagesContainer}
        aria-live="polite"
        role="log"
      >
        {messages.map((msg, idx) => {
          // The last AI message is "streaming" if status is 'streaming'
          const isLatestAI = msg.role === 'ai' && idx === messages.length - 1;
          const isStreaming = isLatestAI && status === 'streaming';
          
          return (
             <MessageBubble 
               key={msg.id} 
               message={msg} 
               isStreaming={isStreaming} 
             />
          );
        })}

        {/* Show thinking indicator before first token arrives */}
        {status === 'thinking' && (
          <div 
            className={styles.thinkingIndicator} 
            role="status" 
            aria-label="AI is thinking"
          >
            <span className={styles.label} style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>AI is thinking</span>
            <span className={`${styles.dot} ${styles.dot1}`}></span>
            <span className={`${styles.dot} ${styles.dot2}`}></span>
            <span className={styles.dot}></span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ask the AI (or try /approve ...)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={inputDisabled}
          aria-label="Type your message"
        />
        <button 
          type="submit" 
          className={styles.sendBtn}
          disabled={!inputValue.trim() || inputDisabled}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </section>
  );
}
