import './index.css';
import Dashboard from './components/Layout/Dashboard';
import ApprovalsPanel from './components/ApprovalsPanel/ApprovalsPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import { useApprovals } from './hooks/useApprovals';
import { useChat } from './hooks/useChat';

/**
 * App — root component.
 *
 * Owns top-level state via custom hooks and threads props down to panels.
 */
export default function App() {
  const { approvals, exitingIds, announcement, approveItem, rejectItem, addApproval } =
    useApprovals();
    
  const { messages, status, sendMessage } = useChat();

  const handleSendMessage = (msg: string) => {
    // We pass addApproval so useChat can handle the /approve bonus command
    sendMessage(msg, (actionText) => {
      addApproval({
        id: crypto.randomUUID(),
        action: actionText,
        requestedAt: new Date().toISOString(),
        meta: 'Added via chat command',
      });
    });
  };

  return (
    <Dashboard
      chatPanel={
        <ChatPanel 
          messages={messages} 
          status={status} 
          onSendMessage={handleSendMessage} 
        />
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
