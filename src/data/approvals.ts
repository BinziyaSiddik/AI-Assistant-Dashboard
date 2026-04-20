/**
 * Starter approval items — loaded on first render (and as the localStorage
 * fallback when no persisted data exists yet).
 *
 * Timestamps are calculated at module load time so the "X min ago"
 * relative time display is always accurate relative to page load.
 */
import type { ApprovalItem } from '../types';

export type { ApprovalItem };

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'a1',
    action: 'Send the Q2 summary report to all department heads',
    requestedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
    meta: '14 recipients',
  },
  {
    id: 'a2',
    action: 'Schedule a team offsite for next Thursday at 2 pm',
    requestedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 min ago
    meta: 'calendar event · 12 attendees',
  },
  {
    id: 'a3',
    action: 'Archive 47 resolved tickets older than 90 days',
    requestedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    meta: 'data operation · reversible',
  },
];
