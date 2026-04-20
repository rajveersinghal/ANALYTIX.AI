import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../store/useStore";
import { 
  Home,
  TrendingUp,
  Upload,
  Archive,
  BarChart3,
  FileText,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageSquare
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { resetSession } = useStore();
  const { clearChat } = useChat();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    document.body.classList.toggle('collapsed');
  };

  const platformItems = [
    { label: "Overview", icon: BarChart3, path: "/analytics" },
    { label: "Workspaces", icon: Home, path: "/projects" },
    { label: "Sales Intel", icon: TrendingUp, path: "/sales", badge: "PRO" },
    { label: "AI Chat", icon: MessageSquare, path: "/chat", badge: "Live" },
    { label: "Upload Center", icon: Upload, path: "/pipeline" },
  ];

  const intelligenceItems = [
    { label: "Archive", icon: Archive, path: "/history" },
    { label: "Reports", icon: FileText, path: "/reports" },
  ];

  const discoveryItems = [
    { label: "Community", icon: Globe, path: "/docs" },
  ];

  const renderNavGroup = (title, items) => (
    <div key={title} className="nav-group">
      <div className="nav-section-label">{title}</div>
      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path || (item.path === '/projects' && location.pathname === '/dashboard');
        return (
          <div 
            key={item.path} 
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            data-tip={item.label}
          >
            <Icon className="nav-icon" size={16} />
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} id="sidebar">
      {/* Logo */}
      <Link to="/" className="sb-logo">
        <svg className="logo-icon" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 13H7L10 5L14 21L17 13H24" stroke="url(#sb_logo_grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="sb_logo_grad" x1="2" y1="13" x2="24" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9a85ff"/><stop offset="1" stopColor="#8169ff"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="logo-wordmark">Analytix<span className="hl-text">AI</span></span>
      </Link>

      {/* New session btn */}
      <button className="new-session" onClick={() => { 
        resetSession(); 
        clearChat();
        navigate('/pipeline'); 
      }}>
        <Plus size={14} strokeWidth={2.5} />
        <span>New Session</span>
      </button>

      {/* Nav */}
      <nav className="sb-nav">
        {renderNavGroup("PLATFORM", platformItems)}
        {renderNavGroup("INTELLIGENCE", intelligenceItems)}
        {renderNavGroup("DISCOVERY", discoveryItems)}
      </nav>

      {/* Bottom Actions */}
      <div className="sb-bottom">
        <div 
          className="nav-item" 
          onClick={() => navigate('/settings')}
          data-tip="Settings"
        >
          <Settings className="nav-icon" size={16} />
          <span className="nav-label">Settings</span>
        </div>
        <div 
          className="nav-item" 
          onClick={() => {
            if (window.confirm('Terminate session?')) {
              logout();
              navigate('/login');
            }
          }}
          data-tip="Logout"
          style={{ marginBottom: '12px' }}
        >
          <LogOut className="nav-icon" size={16} />
          <span className="nav-label">Logout Session</span>
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="collapse-btn" onClick={toggleSidebar}>
        {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
      </div>
    </aside>
  );
}
