import type { ReactNode } from 'react';
import styles from './Dashboard.module.css';

/**
 * Dashboard — top-level layout component.
 *
 * Renders a fixed header bar and a two-column grid that holds
 * the Chat panel and the Approvals panel. On screens ≤ 640 px
 * the grid collapses to a single column (chat on top).
 */

interface DashboardProps {
  /** Left panel — Chat Interface */
  chatPanel: ReactNode;
  /** Right panel — Pending Approvals */
  approvalsPanel: ReactNode;
}

export default function Dashboard({ chatPanel, approvalsPanel }: DashboardProps) {
  return (
    <div className={styles.page}>
      {/* ── App header ── */}
      <header className={styles.header}>
        <div className={styles.logo} aria-hidden="true">
          ✦
        </div>
        <div className={styles.headerText}>
          <h1>AI Assistant Dashboard</h1>
          <p>Chat with your AI and manage pending actions</p>
        </div>
      </header>

      {/* ── Two-panel layout ── */}
      <main className={styles.grid}>
        {chatPanel}
        {approvalsPanel}
      </main>
    </div>
  );
}
