import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Upload from "./pages/upload/Upload";
import Insights from "./pages/insights/Insights";
import Chat from "./pages/chat/Chat";
import Archive from "./pages/archive/Archive";
import Settings from "./pages/settings/Settings";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000]">
      <div className="relative flex flex-col items-center gap-6 animate-pulse">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 32H18L26 14L34 50L42 32H56" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-white font-bold tracking-[0.2em] uppercase text-xs">AnalytixAI</span>
          <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/40 animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected App Routes */}
          <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="insights" element={<Insights />} />
            <Route path="chat" element={<Chat />} />
            <Route path="archive" element={<Archive />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
