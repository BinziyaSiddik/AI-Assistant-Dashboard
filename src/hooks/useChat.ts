import { useState, useRef, useEffect, useCallback } from 'react';
import { streamAi } from '../utils/streamAi';
import type { Message, ChatStatus } from '../types';

/**
 * useChat.ts
 *
 * Custom hook to manage chat state and AI streaming.
 *
 * Key details:
 * 1. AbortController ensures cleanup on unmount (Code Review Q1).
 * 2. Explicit 'idle' | 'thinking' | 'streaming' states for fine-grained UI.
 */

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Hello! I am your AI assistant. How can I help you today?',
    },
  ]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  
  // Keep track of the active stream so we can cancel it if the user leaves
  const abortControllerRef = useRef<AbortController | null>(null);

  // Note for Code Review Q1:
  // If the user navigates away or closes the tab while the AI is streaming,
  // this cleanup function runs, calling .abort().
  // For the simulation, it stops the loop early.
  // For a real API, it actively kills the HTTP connection, saving bandwidth.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      // Pass this in to allow /approve to add an item
      onAddApproval?: (action: string) => void
    ) => {
      if (!content.trim()) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMsg]);
      setStatus('thinking');

      // Setup abort controller for this stream
      abortControllerRef.current?.abort(); // Cancel any existing
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Wait a tiny bit in 'thinking' state just to show the UI
        await new Promise((r) => setTimeout(r, 600));
        if (controller.signal.aborted) return;

        // If it's a slash command, handle it natively
        if (content.toLowerCase().startsWith('/approve') && onAddApproval) {
          const actionText = content.replace(/^\/approve\s*/i, '').trim() || 'Custom approved action';
          onAddApproval(actionText);
        }

        const aiMsgId = crypto.randomUUID();
        
        // Add empty AI message and switch to streaming
        setMessages((prev) => [
          ...prev,
          { id: aiMsgId, role: 'ai', content: '' },
        ]);
        setStatus('streaming');

        // Consume the generator
        const stream = streamAi(content, controller.signal);
        
        const chars: string[] = [];
        let isDone = false;

        // ── Consumer Loop (UI Smoothing Frame Rate) ──
        // This constantly pulls 1 character from the buffer every 15ms,
        // guaranteeing a buttery-smooth typewriter effect regardless 
        // of how "chunky" the internet connection is.
        const drainBuffer = async () => {
          let currentContent = '';
          while (!isDone || chars.length > 0) {
            if (controller.signal.aborted) break;
            
            if (chars.length > 0) {
              const char = chars.shift()!;
              currentContent += char;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: currentContent } : m
                )
              );
            }
            
            // Pop the next character extremely quickly (approx 60fps)
            await new Promise((r) => setTimeout(r, 15));
          }
        };

        // Start the UI consumer loop in the background
        const consumerPromise = drainBuffer();

        // ── Producer Loop (Network Fetch) ──
        for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          // Break the network chunk into an array of single characters and queue them
          chars.push(...chunk.split('')); 
        }
        isDone = true;
        
        // Wait for the UI consumer to finish typing the rest of the queue
        await consumerPromise;
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            console.error('Streaming error:', err);
            setStatus('idle');
          }
        } else {
          console.error('Unknown streaming error:', err);
          setStatus('idle');
        }
        if (!controller.signal.aborted) {
          setStatus('idle');
          abortControllerRef.current = null;
        }
      }
    },
    []
  );

  return { messages, status, sendMessage };
}
