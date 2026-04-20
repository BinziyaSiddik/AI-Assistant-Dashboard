/**
 * ApprovalsPanel — displays the list of AI-proposed actions awaiting
 * human review. Handles both the populated list and the empty state.
 *
 * Accessibility:
 * ─────────────
 * - aria-live="polite" region announces approve/reject to screen readers.
 * - Each ApprovalItem button has a descriptive aria-label.
 * - Empty state uses role="status" so assistive tech notices the change.
 * - Panel header is a semantic <header> with an <h2>.
 */

import ApprovalItem from './ApprovalItem';
import styles from './ApprovalsPanel.module.css';
import type { ApprovalItem as ApprovalItemType } from '../../types';

// ── Props ──────────────────────────────────────────────────────────────────

interface ApprovalsPanelProps {
  approvals: ApprovalItemType[];
  exitingIds: Set<string>;
  announcement: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ApprovalsPanel({
  approvals,
  exitingIds,
  announcement,
  onApprove,
  onReject,
}: ApprovalsPanelProps) {
  const pendingCount = approvals.length;

  return (
    <section className={styles.panel} aria-labelledby="approvals-heading">
      {/* ── Panel header ── */}
      <header className={styles.header}>
        <h2 id="approvals-heading" className={styles.title}>
          Pending Approvals
        </h2>

        {/* Badge — only shown when there are items */}
        {pendingCount > 0 && (
          <span
            className={styles.badge}
            aria-label={`${pendingCount} pending action${pendingCount !== 1 ? 's' : ''}`}
          >
            {pendingCount}
          </span>
        )}
      </header>

      {/*
        ── ARIA live region ──
        Visually hidden; only read aloud by screen readers.
        Updated to "Action approved." or "Action rejected." on each dismiss.
        aria-atomic="true" ensures the full sentence is read, not just the diff.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* ── Item list or empty state ── */}
      {pendingCount > 0 ? (
        <ul className={styles.list} aria-label="Pending approval items">
          {approvals.map((item) => (
            <ApprovalItem
              key={item.id}
              item={item}
              isExiting={exitingIds.has(item.id)}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </ul>
      ) : (
        /* Empty state — role="status" so screen readers announce the change */
        <div className={styles.emptyState} role="status">
          <span className={styles.emptyIcon} aria-hidden="true">✓</span>
          <p className={styles.emptyTitle}>All caught up!</p>
          <p className={styles.emptySubtitle}>
            No pending actions — the AI is waiting for your next request.
          </p>
        </div>
      )}
    </section>
  );
}
