/**
 * ApprovalItem — a single pending action card.
 *
 * Applies the .exiting CSS class when its ID is in the exitingIds Set,
 * triggering the fade + slide exit animation independently of other items.
 * This makes rapid multi-approve safe (Code Review Q2).
 */

import type { ApprovalItem as ApprovalItemType } from '../../types';
import styles from './ApprovalItem.module.css';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts an ISO 8601 timestamp to a human-readable relative string.
 * e.g. "2 min ago", "1 hr ago", "just now"
 */
function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hr ago`;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface ApprovalItemProps {
  item: ApprovalItemType;
  /** Whether this item is currently playing its exit animation. */
  isExiting: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ApprovalItem({
  item,
  isExiting,
  onApprove,
  onReject,
}: ApprovalItemProps) {
  return (
    <li
      className={`${styles.item} ${isExiting ? styles.exiting : ''}`}
      aria-label={`Pending action: ${item.action}`}
    >
      {/* Action description */}
      <p className={styles.action}>{item.action}</p>

      {/* Time + context meta */}
      <p className={styles.meta}>
        Requested {timeAgo(item.requestedAt)} · {item.meta}
      </p>

      {/* Approve / Reject buttons */}
      <div className={styles.buttons}>
        <button
          className={`${styles.btn} ${styles.approve}`}
          onClick={() => onApprove(item.id)}
          /* Descriptive aria-label so screen readers know what is being approved */
          aria-label={`Approve: ${item.action}`}
          disabled={isExiting}
        >
          ✓ Approve
        </button>

        <button
          className={`${styles.btn} ${styles.reject}`}
          onClick={() => onReject(item.id)}
          aria-label={`Reject: ${item.action}`}
          disabled={isExiting}
        >
          ✕ Reject
        </button>
      </div>
    </li>
  );
}
