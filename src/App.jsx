import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./pages/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Landing from "./pages/Landing";
import Projects from "./pages/Projects";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import HistoryView from "./pages/HistoryView";
import Pipeline from "./pages/Pipeline";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import SalesDashboard from "./pages/SalesDashboard";
import Docs from "./pages/Docs";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import TierGuard from "./pages/TierGuard";
import { ChatProvider } from "./context/ChatContext";
import ChatView from "./pages/ChatView";

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#04050f] text-white p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black syne italic mb-4">Neural Override <span className="text-rose-500">Triggered</span></h1>
          <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">A runtime exception occurred in the UI orchestration layer. The diagnostic log has been captured.</p>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left font-mono text-[10px] text-rose-300 mb-8 max-w-lg overflow-auto">
             {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-violet-600 rounded-2xl font-bold hover:bg-violet-700 transition-all"
          >
            Return to Command Center
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/docs" element={<Docs />} />

            {/* ── Protected Dashboard Routes (all require auth + MainLayout) ── */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              {/* Bookmarkable Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:sessionId" element={<Dashboard />} />
              <Route path="/dashboard/:sessionId/:activeStep" element={<Dashboard />} />

              <Route path="/projects"   element={<Projects />} />
              <Route path="/pipeline"   element={<Pipeline />} />
              <Route path="/analytics"  element={<Analytics />} />
              <Route path="/reports"    element={<Reports />} />
              <Route path="/insights"   element={<Insights />} />
              <Route path="/history"    element={<HistoryView />} />
              
              {/* Premium Gated Routes */}
              <Route path="/chat"  element={<TierGuard><ChatView /></TierGuard>} />
              <Route path="/sales" element={<TierGuard><SalesDashboard /></TierGuard>} />
              
              <Route path="/pricing"    element={<Pricing />} />
              <Route path="/settings"   element={<Settings />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
