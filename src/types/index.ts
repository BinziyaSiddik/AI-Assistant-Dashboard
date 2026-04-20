/**
 * Shared TypeScript types used across the application.
 * Centralised here so components and hooks import from one place.
 */

// ── Approval types ─────────────────────────────────────────────────────────

/**
 * A single action the AI is waiting for a human to approve or reject.
 */
export interface ApprovalItem {
  /** Unique identifier (nanoid / uuid). */
  id: string;
  /** Human-readable description of the proposed AI action. */
  action: string;
  /** ISO 8601 timestamp of when the AI requested the action. */
  requestedAt: string;
  /** Short context label shown below the action text (e.g. "14 recipients"). */
  meta: string;
}

// ── Chat types ─────────────────────────────────────────────────────────────

/** Who authored a chat message. */
export type MessageRole = 'user' | 'ai';

/**
 * A single message in the chat conversation history.
 */
export interface Message {
  /** Unique identifier for the message. */
  id: string;
  /** Whether this message is from the user or the AI. */
  role: MessageRole;
  /** Accumulated text content of the message. Updated token-by-token for AI messages. */
  content: string;
}

/**
 * Explicit streaming lifecycle states for the chat hook.
 *
 * - 'idle'      → No request in flight. Input is enabled.
 * - 'thinking'  → Request sent, awaiting the first token. Show typing dots.
 * - 'streaming' → Tokens are arriving. Show blinking cursor on the AI bubble.
 */
export type ChatStatus = 'idle' | 'thinking' | 'streaming';
