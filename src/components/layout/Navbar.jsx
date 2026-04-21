import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useStore } from "../../store/useStore";
import { Search, Bell, HelpCircle, Zap, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext";

export default function Navbar({ onSearchClick }) {
  const { sessionId, metadata, status, resetSession } = useStore();
  const { clearChat } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('') || 'RS';

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="search-wrap" onClick={onSearchClick} style={{ cursor: 'pointer' }}>
        <Search className="search-icon" size={14} />
        <input 
          type="text" 
          placeholder="Search sessions, metrics, datasets..." 
          id="search-input" 
          readOnly 
          style={{ cursor: 'pointer' }}
        />
        <div className="search-hint">
          <kbd>⌘</kbd> <kbd>K</kbd>
        </div>
      </div>

      <div className="tb-spacer"></div>

      <div className="tb-actions">
        {/* Active Session Indicator */}
        <div className="active-session-chip" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
          <span style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Active Session</span>
          <div 
            onClick={() => navigate('/history')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bdr)', borderRadius: '6px', cursor: 'pointer' }}
          >
             <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t1)' }}>
               {metadata?.filename || (status === 'processing' ? 'Processing Data...' : 'No Active Session')}
             </span>
             {sessionId && (
               <X 
                 size={12} 
                 className="close-sess-icon" 
                 style={{ marginLeft: '4px', opacity: 0.5 }} 
                 onClick={(e) => {
                   e.stopPropagation();
                    if (window.confirm("Close active session?")) {
                      resetSession();
                      clearChat();
                    }
                 }}
               />
             )}
             <ChevronDown size={12} className="text-var(--t3)" />
          </div>
        </div>

        <button className="btn-upgrade" onClick={() => navigate('/settings')} style={{ background: '#1a1440', border: '1px solid #3d3380', color: '#b0a0ff' }}>
          <Zap size={13} strokeWidth={2.5} fill="#b0a0ff" />
          Upgrade to Pro
        </button>

        <div className="icon-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications">
          <Bell size={15} />
          {/* Dot to indicate unread notifs */}
        </div>

        <div className="tb-avatar" onClick={() => navigate('/settings')}>
          {initials}
        </div>
      </div>

      {/* Notifications panel remains same */}
      <div className={`notif-panel ${showNotif ? 'open' : ''}`} ref={notifRef}>
        <div className="notif-header">
          <span className="notif-title">Notifications</span>
          <span className="notif-clear" onClick={() => setShowNotif(false)}>Mark all read</span>
        </div>
        <div className="notif-item">
          <div className="ni-dot" style={{ background: 'var(--mint)' }}></div>
          <div className="ni-body">
            <div className="ni-text">Pipeline completed with <strong>94.7%</strong> accuracy</div>
            <div className="ni-time">5 mins ago</div>
          </div>
        </div>
      </div>
    </header>
  );
}
