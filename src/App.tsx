import './index.css';
import Dashboard from './components/Layout/Dashboard';

/**
 * App — root component.
 *
 * Wires together the Dashboard layout with placeholder panels.
 * Real panel components will be added in subsequent commits.
 */
export default function App() {
  return (
    <Dashboard
      chatPanel={
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Chat panel — coming in Commit 5
        </div>
      }
      approvalsPanel={
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Approvals panel — coming in Commit 4
        </div>
      }
    />
  );
}
