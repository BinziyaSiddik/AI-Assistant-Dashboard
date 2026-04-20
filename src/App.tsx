import './index.css';
import Dashboard from './components/Layout/Dashboard';
import ApprovalsPanel from './components/ApprovalsPanel/ApprovalsPanel';
import { useApprovals } from './hooks/useApprovals';

/**
 * App — root component.
 *
 * Owns top-level state via custom hooks and threads props down to panels.
 * Chat panel will be wired in Commit 5.
 */
export default function App() {
  const { approvals, exitingIds, announcement, approveItem, rejectItem } =
    useApprovals();

  return (
    <Dashboard
      chatPanel={
        /* Placeholder — replaced in Commit 5 */
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            color: 'var(--muted)',
            fontSize: '0.9rem',
            minHeight: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Chat panel — coming in Commit 5
        </div>
      }
      approvalsPanel={
        <ApprovalsPanel
          approvals={approvals}
          exitingIds={exitingIds}
          announcement={announcement}
          onApprove={approveItem}
          onReject={rejectItem}
        />
      }
    />
  );
}

/* Expose addApproval for future use by the chat panel (Commit 7) */
export type { };
export { };
