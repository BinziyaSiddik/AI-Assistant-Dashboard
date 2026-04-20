/**
 * useApprovals.ts
 *
 * Custom hook that manages the Pending Approvals list.
 *
 * Key design decisions:
 * ─────────────────────
 * 1. PERSISTENCE  — Items are read from localStorage on mount and written
 *    back on every change (Bonus requirement).
 *
 * 2. RAPID-CLICK SAFETY (Code Review Q2) — Each item tracks its own exit
 *    animation independently via a Set<string> of "exiting" IDs.
 *    Approving A then immediately approving B triggers two independent
 *    setTimeout calls; they never interfere with each other.
 *
 * 3. ADD FROM CHAT (Bonus) — addApproval() is exposed so the chat panel
 *    can inject new items via the /approve slash command.
 */

import { useState, useEffect, useCallback } from 'react';
import { INITIAL_APPROVALS } from '../data/approvals';
import type { ApprovalItem } from '../types';

/** localStorage key for persisting approvals between page reloads. */
const STORAGE_KEY = 'ai-dashboard:approvals';

/** Duration must match the CSS transition on .itemExiting (350 ms). */
const EXIT_DURATION_MS = 350;

// ── Helpers ────────────────────────────────────────────────────────────────

/** Read persisted approvals. Falls back to INITIAL_APPROVALS on first load. */
function loadFromStorage(): ApprovalItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ApprovalItem[];
  } catch {
    // Corrupted data — start fresh.
  }
  return INITIAL_APPROVALS;
}

/** Persist the current approvals list to localStorage. */
function saveToStorage(items: ApprovalItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded or private-browsing restriction — ignore silently.
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

interface UseApprovalsReturn {
  /** Current list of pending approvals (excludes already-dismissed items). */
  approvals: ApprovalItem[];
  /** IDs of items currently playing their exit animation. */
  exitingIds: Set<string>;
  /** Approve an item — starts exit animation, then removes from list. */
  approveItem: (id: string) => void;
  /** Reject an item — starts exit animation, then removes from list. */
  rejectItem: (id: string) => void;
  /** Add a new approval item (used by the /approve slash command). */
  addApproval: (item: ApprovalItem) => void;
  /** The latest screen-reader announcement (resets to '' after 1 s). */
  announcement: string;
}

export function useApprovals(): UseApprovalsReturn {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(loadFromStorage);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  // Persist to localStorage whenever the list changes.
  useEffect(() => {
    saveToStorage(approvals);
  }, [approvals]);

  /**
   * Core dismiss logic — shared by approve and reject.
   * 1. Adds the id to exitingIds  → CSS exit animation starts on that item.
   * 2. After EXIT_DURATION_MS     → removes the item from the list.
   *
   * Two rapid calls create two independent timers — no race condition.
   */
  const dismiss = useCallback((id: string, verb: string) => {
    // Mark as exiting (triggers CSS fade/slide-out on the specific item).
    setExitingIds((prev) => new Set(prev).add(id));

    // Announce to screen readers via the aria-live region.
    setAnnouncement(`Action ${verb}.`);

    // Reset announcement so the same action can be re-announced later.
    const announcementTimer = setTimeout(() => setAnnouncement(''), 1000);

    // Remove from list after animation completes.
    const removeTimer = setTimeout(() => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, EXIT_DURATION_MS);

    // Note: these timers are NOT cleared on unmount because the component
    // will already be gone by then and React 18 suppresses the setState
    // warning. For a production app, track them in a ref for cleanup.
    return () => {
      clearTimeout(announcementTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const approveItem = useCallback(
    (id: string) => dismiss(id, 'approved'),
    [dismiss],
  );

  const rejectItem = useCallback(
    (id: string) => dismiss(id, 'rejected'),
    [dismiss],
  );

  const addApproval = useCallback((item: ApprovalItem) => {
    setApprovals((prev) => [item, ...prev]);
  }, []);

  return { approvals, exitingIds, approveItem, rejectItem, addApproval, announcement };
}
