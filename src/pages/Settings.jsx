import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Legend,
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/api";

/* ─── mock usage history ─────────────────────────────────────────── */
const USAGE_DATA = [
  { name: "W1", runs: 2, api: 420 },
  { name: "W2", runs: 1, api: 380 },
  { name: "W3", runs: 3, api: 910 },
  { name: "W4", runs: 2, api: 740 },
  { name: "W5", runs: 4, api: 1420 },
  { name: "W6", runs: 3, api: 1180 },
  { name: "W7", runs: 5, api: 1840 },
  { name: "W8", runs: 4, api: 1290 },
];

/* ─── mini toast ─────────────────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  };
  return { toasts, push };
}

function ToastList({ toasts }) {
  const colors = {
    success: "var(--mint)",
    err: "var(--rose)",
    info: "#b0a0ff",
  };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: "var(--bg-3)",
          border: `1px solid ${colors[t.type] || colors.info}33`,
          borderLeft: `3px solid ${colors[t.type] || colors.info}`,
          borderRadius: "var(--r-md)", padding: "10px 16px",
          color: "var(--t1)", fontSize: ".82rem", fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,.5)",
          animation: "fadeIn .25s ease both",
          pointerEvents: "auto",
          maxWidth: 320,
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─── reusable sub-components ────────────────────────────────────── */
function SectionCard({ children, danger = false, style = {} }) {
  return (
    <div style={{
      background: "var(--sur)",
      border: `1px solid ${danger ? "rgba(244,63,94,.22)" : "var(--bdr)"}`,
      borderRadius: "var(--r-lg)",
      padding: "24px",
      marginBottom: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHead({ title, sub, action }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".9rem",
            color: "var(--t1)", marginBottom: 3,
          }}>{title}</div>
          {sub && <div style={{ fontSize: ".78rem", color: "var(--t3)" }}>{sub}</div>}
        </div>
        {action}
      </div>
    </div>
  );
}

function FieldGroup({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: ".75rem", fontWeight: 600,
        color: "var(--t2)", marginBottom: 6, letterSpacing: ".01em",
      }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: ".68rem", color: "var(--t3)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Input({ type = "text", ...props }) {
  return (
    <input
      type={type}
      {...props}
      style={{
        width: "100%", padding: "9px 12px",
        background: "rgba(255,255,255,.04)",
        border: "1px solid var(--bdr)", borderRadius: "var(--r-sm)",
        color: "var(--t1)", fontFamily: "'Figtree',sans-serif", fontSize: ".84rem",
        outline: "none", boxSizing: "border-box",
        transition: "border-color .22s",
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = "rgba(109,78,255,.5)"; e.target.style.background = "rgba(109,78,255,.04)"; }}
      onBlur={(e) => { e.target.style.borderColor = "var(--bdr)"; e.target.style.background = "rgba(255,255,255,.04)"; }}
    />
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 40, height: 22, borderRadius: 100, border: "none",
        background: on ? "var(--violet)" : "var(--bdr)",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background .22s",
        padding: 0,
      }}
      aria-checked={on}
      role="switch"
    >
      <span style={{
        position: "absolute", top: 3, left: on ? 20 : 3,
        width: 16, height: 16, borderRadius: 50,
        background: "#fff", transition: "left .22s",
        display: "block",
      }} />
    </button>
  );
}

function ToggleRow({ title, desc, on, onToggle }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: "1px solid var(--bdr)",
    }}>
      <div>
        <div style={{ fontSize: ".83rem", fontWeight: 500, color: "var(--t1)" }}>{title}</div>
        {desc && <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: 2 }}>{desc}</div>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function UsageBar({ used, total, label, subLabel, warn = false }) {
  const pct = Math.min((used / total) * 100, 100);
  const color = pct > 80 ? "var(--rose)" : pct > 60 ? "var(--amber)" : "linear-gradient(90deg,var(--violet),var(--mint))";
  return (
    <div style={{
      background: "var(--bg-3)", border: "1px solid var(--bdr)",
      borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--t1)" }}>{label}</span>
        <span style={{
          fontSize: ".75rem", fontWeight: 700,
          color: pct > 80 ? "var(--rose)" : pct > 60 ? "var(--amber)" : "var(--mint)",
        }}>{subLabel}</span>
      </div>
      <div style={{ height: 6, background: "var(--bdr)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: typeof color === "string" && color.includes("gradient") ? color : color,
          borderRadius: 100, transition: "width .8s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
      <div style={{ fontSize: ".68rem", color: "var(--t3)", marginTop: 5 }}>{subLabel} used · {pct.toFixed(1)}%</div>
    </div>
  );
}

/* ─── NAV ITEMS ──────────────────────────────────────────────────── */
const NAV = [
  { id: "pricing", label: "Plan & Pricing", icon: "⚡", group: "Subscription" },
  { id: "usage", label: "Usage Meter", icon: "📊", group: "Subscription" },
  { id: "profile", label: "Profile", icon: "👤", group: "Account" },
  { id: "password", label: "Password & 2FA", icon: "🔒", group: "Account" },
  { id: "notifications", label: "Notifications", icon: "🔔", group: "Account" },
  { id: "apikeys", label: "API Keys", icon: "🗝️", group: "Developer" },
  { id: "danger", label: "Danger Zone", icon: "⚠️", group: "Danger" },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export default function Settings() {
  const { user, logout } = useAuth();
  const { toasts, push: toast } = useToast();

  const [activeTab, setActiveTab] = useState("pricing");
  const [dirty, setDirty] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  /* profile state */
  const [profile, setProfile] = useState({
    firstName: user?.full_name?.split(" ")[0] || "Rajveer",
    lastName: user?.full_name?.split(" ").slice(1).join(" ") || "Singhal",
    email: user?.email || "rajveer@company.com",
    role: "AI Data Lead",
    company: "Analytix Corp",
    bio: "Data intelligence lead focused on ML-driven sales analytics.",
    timezone: "IST",
  });

  /* password state */
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwStrength, setPwStrength] = useState({ score: 0, label: "Weak", color: "var(--rose)" });

  /* notification prefs */
  const [notif, setNotif] = useState({
    pipeDone: true, pipeFail: true, pipeAlert: false,
    digest: false, billing: true, limitWarn: true,
    product: true, tips: false,
    inPipeline: true, inShap: true, inWorkspace: false,
  });

  /* API keys */
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Production Key", key: "sk-aai-xJ8mKp2nQrTv4wYzBcDeFgHiLlNoPqRsXkP9", created: "Apr 1, 2026", lastUsed: "2h ago", revealed: false },
    { id: 2, name: "Dev / Testing", key: "sk-aai-aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2m", created: "Mar 15, 2026", lastUsed: "3d ago", revealed: false },
  ]);

  /* sessions */
  const [sessions, setSessions] = useState([
    { id: 1, name: "Chrome on macOS", meta: "Delhi, India · Active now", current: true, revoked: false },
    { id: 2, name: "Safari on iPhone 15", meta: "Delhi, India · 2h ago", current: false, revoked: false },
    { id: 3, name: "Firefox on Windows", meta: "Mumbai, India · 1d ago", current: false, revoked: false },
  ]);

  /* preferences */
  const [prefs, setPrefs] = useState({ compact: false, trends: true, autochat: false, twoFA: false });

  const markDirty = () => setDirty(true);

  /* ── profile save ── */
  const saveProfile = () => {
    if (!profile.firstName.trim()) { toast("First name is required", "err"); return; }
    setDirty(false);
    toast("Profile saved successfully", "success");
  };

  /* ── pw strength ── */
  const calcStrength = (v) => {
    if (!v) return { score: 0, label: "Weak", color: "var(--rose)" };
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["var(--rose)", "var(--rose)", "var(--amber)", "var(--indigo)", "var(--mint)"];
    return { score: s, label: labels[s], color: colors[s] };
  };

  /* ── stripe checkout ── */
  const handleUpgrade = async (plan) => {
    try {
      setCheckoutLoading(plan);
      const data = await apiClient.createCheckoutSession(plan);
      if (data?.checkout_url) window.location.href = data.checkout_url;
      else toast("Checkout session created — redirecting…", "success");
    } catch {
      toast("Failed to start checkout. Please try again.", "err");
    } finally {
      setCheckoutLoading(null);
    }
  };

  /* ── api keys ── */
  const createKey = () => {
    const id = Date.now();
    const name = `Key ${apiKeys.length + 1}`;
    setApiKeys((p) => [...p, {
      id, name,
      key: "sk-aai-" + Math.random().toString(36).slice(2, 18),
      created: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      lastUsed: "Just created", revealed: false,
    }]);
    toast(`${name} created — copy it now`, "success");
  };
  const revealKey = (id) => setApiKeys((p) => p.map((k) => k.id === id ? { ...k, revealed: !k.revealed } : k));
  const copyKey = (key) => { navigator.clipboard?.writeText(key); toast("Copied to clipboard", "success"); };
  const revokeKey = (id, name) => { setApiKeys((p) => p.filter((k) => k.id !== id)); toast(`${name} revoked`, "err"); };

  /* ── sessions ── */
  const revokeSession = (id) => setSessions((p) => p.map((s) => s.id === id ? { ...s, revoked: true } : s));

  /* ── danger ── */
  const danger = (action, title, desc) => {
    if (!window.confirm(`${title}\n\n${desc}\n\nAre you sure?`)) return;
    if (action === "clear") toast("All sessions cleared", "err");
    if (action === "delete-ws") toast("All workspaces deleted", "err");
    if (action === "delete-account") {
      toast("Account deletion scheduled — goodbye!", "err");
      setTimeout(() => { logout(); window.location.href = "/login"; }, 2000);
    }
    if (action === "terminate") {
      setSessions((p) => p.map((s) => s.current ? s : { ...s, revoked: true }));
      toast("All other sessions terminated", "success");
    }
  };

  const isProUser = user?.tier === "pro" || user?.tier === "enterprise";
  const currentPlan = isProUser ? "Pro" : "Free";

  /* ── sidebar groups ── */
  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="view active" id="m7-settings">
      <ToastList toasts={toasts} />

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mint)", display: "inline-block" }} />
          <span style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t3)" }}>Billing & Settings</span>
        </div>
        <h1 style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.6rem",
          letterSpacing: "-.035em", color: "var(--t1)", marginBottom: 4, margin: 0,
        }}>
          Settings & <span style={{ background: "linear-gradient(130deg,#b39dfa,#6d4eff 50%,#00e5b0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Billing</span>
        </h1>
        <p style={{ fontSize: ".87rem", color: "var(--t2)", marginTop: 4 }}>Manage your plan, usage, profile, and workspace preferences.</p>
      </div>

      {/* ── LAYOUT ── */}
      <div className="settings-grid">

        {/* ── SIDEBAR ── */}
        <div className="settings-nav">
          {groups.map((g, gi) => (
            <div key={g}>
              {gi > 0 && <div style={{ height: 1, background: "var(--bdr)", margin: "6px 0" }} />}
              <div style={{
                fontSize: ".6rem", fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", color: "var(--t3)",
                padding: "6px 8px 2px",
              }}>{g}</div>
              {NAV.filter((n) => n.group === g).map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActiveTab(n.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    padding: "7px 10px", borderRadius: "var(--r-sm)",
                    background: activeTab === n.id ? "var(--violet-g)" : "transparent",
                    border: "none",
                    color: activeTab === n.id ? "var(--t1)" : (g === "Danger" ? "var(--rose)" : "var(--t2)"),
                    fontSize: ".82rem", fontWeight: activeTab === n.id ? 600 : 500,
                    cursor: "pointer", textAlign: "left", transition: "all .18s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { if (activeTab !== n.id) e.currentTarget.style.background = "var(--sur-h)"; }}
                  onMouseLeave={(e) => { if (activeTab !== n.id) e.currentTarget.style.background = "transparent"; }}
                >
                  {activeTab === n.id && (
                    <span style={{
                      position: "absolute", left: 0, top: "20%", bottom: "20%",
                      width: 3, borderRadius: "0 2px 2px 0",
                      background: g === "Danger" ? "var(--rose)" : "var(--violet)",
                    }} />
                  )}
                  <span style={{ fontSize: ".75rem" }}>{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── PANELS ── */}
        <div style={{ minWidth: 0 }}>

          {/* ══════════════════════════════════ PRICING ══ */}
          {activeTab === "pricing" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard>
                <CardHead
                  title="Current Plan"
                  sub={<>You are on the <strong style={{ color: "var(--t1)" }}>{currentPlan}</strong> plan.</>}
                  action={
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 100,
                      background: "var(--violet-g)", border: "1px solid rgba(109,78,255,.25)",
                      color: "#b0a0ff", fontSize: ".7rem", fontWeight: 700,
                    }}>
                      ⚡ {currentPlan}
                    </span>
                  }
                />

                {/* 3-tier plan grid */}
                <div className="kpi-row mb-6">
                  {[
                    {
                      name: "Free", price: "₹0", period: "/ lifetime", desc: "Perfect for testing.",
                      feats: ["3 runs / month", "Real-time KPIs", "PDF exports", "7-Day history"],
                      cta: "Current Plan", ctaDisabled: !isProUser, isCurrent: !isProUser,
                      plan: null,
                    },
                    {
                      name: "Pro", price: "₹499", period: "/ month", desc: "For serious data teams.",
                      feats: ["Unlimited runs", "SHAP explainability", "Gemini Playbook", "AI Chat widget", "Priority support"],
                      cta: isProUser ? "Current Active Plan" : "Upgrade to Pro",
                      ctaDisabled: isProUser, isCurrent: isProUser, popular: true,
                      plan: "pro",
                    },
                    {
                      name: "Enterprise", price: "Custom", period: "", desc: "For large organisations.",
                      feats: ["Team access", "White-label", "Custom POS sync", "Dedicated SLA", "Audit logs"],
                      cta: "Contact Sales", ctaDisabled: false, isCurrent: false,
                      plan: "enterprise",
                    },
                  ].map((tier) => (
                    <div key={tier.name} style={{
                      background: tier.popular ? "rgba(109,78,255,.06)" : "var(--bg-3)",
                      border: `1px solid ${tier.isCurrent ? "rgba(109,78,255,.4)" : tier.popular ? "rgba(109,78,255,.3)" : "var(--bdr)"}`,
                      borderRadius: "var(--r-lg)", padding: "20px 18px",
                      position: "relative",
                      boxShadow: tier.popular ? "0 0 32px rgba(109,78,255,.12)" : "none",
                      transition: "border-color .22s, transform .22s",
                    }}
                      onMouseEnter={(e) => { if (!tier.isCurrent) e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {tier.popular && (
                        <div style={{
                          position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                          background: "var(--violet)", color: "#fff",
                          fontSize: ".6rem", fontWeight: 800, padding: "3px 10px",
                          borderRadius: 100, textTransform: "uppercase", letterSpacing: ".06em",
                        }}>Most Popular</div>
                      )}
                      {tier.isCurrent && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          background: "rgba(0,229,176,.12)", color: "var(--mint)",
                          fontSize: ".6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                          border: "1px solid rgba(0,229,176,.25)",
                        }}>Active</div>
                      )}
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".9rem", color: "var(--t1)", marginBottom: 6 }}>{tier.name}</div>
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "var(--t1)" }}>{tier.price}</span>
                        {tier.period && <span style={{ fontSize: ".72rem", color: "var(--t3)", marginLeft: 4 }}>{tier.period}</span>}
                      </div>
                      <div style={{ fontSize: ".74rem", color: "var(--t3)", marginBottom: 12 }}>{tier.desc}</div>
                      <div style={{ marginBottom: 14 }}>
                        {tier.feats.map((f) => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".75rem", color: "var(--t2)", marginBottom: 5 }}>
                            <span style={{ color: "var(--mint)", fontSize: ".7rem", flexShrink: 0 }}>✓</span> {f}
                          </div>
                        ))}
                      </div>
                      <button
                        disabled={tier.ctaDisabled || checkoutLoading === tier.plan}
                        onClick={() => tier.plan && handleUpgrade(tier.plan)}
                        style={{
                          width: "100%", padding: "9px 12px",
                          background: tier.isCurrent ? "transparent" : tier.popular ? "var(--violet)" : "var(--sur)",
                          border: `1px solid ${tier.isCurrent ? "var(--bdr)" : tier.popular ? "var(--violet)" : "var(--bdr-s)"}`,
                          borderRadius: "var(--r-sm)", color: tier.isCurrent ? "var(--t3)" : tier.popular ? "#fff" : "var(--t2)",
                          fontSize: ".78rem", fontWeight: 600, cursor: tier.ctaDisabled ? "default" : "pointer",
                          fontFamily: "'Figtree',sans-serif", opacity: tier.ctaDisabled ? .6 : 1,
                          transition: "all .2s",
                        }}
                        onMouseEnter={(e) => { if (!tier.ctaDisabled && tier.popular) e.currentTarget.style.background = "var(--violet-d)"; }}
                        onMouseLeave={(e) => { if (tier.popular) e.currentTarget.style.background = "var(--violet)"; }}
                      >
                        {checkoutLoading === tier.plan ? "Initializing…" : tier.cta}
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {!isProUser && (
                    <button
                      onClick={() => handleUpgrade("pro")}
                      disabled={!!checkoutLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "9px 20px", borderRadius: "var(--r-sm)",
                        background: "var(--violet)", border: "none", color: "#fff",
                        fontSize: ".82rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Figtree',sans-serif",
                        transition: "background .2s, box-shadow .2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--violet-d)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,78,255,.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--violet)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      ⚡ Upgrade to Pro — ₹499/mo
                    </button>
                  )}
                  <button
                    onClick={() => toast("Opening Stripe billing portal…", "info")}
                    style={{
                      padding: "9px 18px", borderRadius: "var(--r-sm)",
                      background: "transparent", border: "1px solid var(--bdr-s)",
                      color: "var(--t2)", fontSize: ".82rem", fontWeight: 500,
                      cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                      transition: "border-color .2s, color .2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bdr-focus)"; e.currentTarget.style.color = "var(--t1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bdr-s)"; e.currentTarget.style.color = "var(--t2)"; }}
                  >
                    Manage subscription
                  </button>
                </div>
              </SectionCard>

              {/* Billing details */}
              <SectionCard>
                <CardHead title="Billing Details" sub="Payment method and billing address." />
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: "var(--bg-3)", border: "1px solid var(--bdr)",
                  borderRadius: "var(--r-md)", marginBottom: 14,
                }}>
                  <div style={{ width: 36, height: 22, borderRadius: 4, background: "linear-gradient(135deg,#1a1f36,#2d3154)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", color: "#f5a623", fontWeight: 900, flexShrink: 0 }}>VISA</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".8rem", fontWeight: 500, color: "var(--t1)" }}>No card on file</div>
                    <div style={{ fontSize: ".7rem", color: "var(--t3)" }}>Add a payment method to upgrade</div>
                  </div>
                  <button
                    onClick={() => toast("Opening Stripe payment setup…", "info")}
                    style={{
                      padding: "5px 12px", borderRadius: "var(--r-sm)",
                      background: "transparent", border: "1px solid var(--bdr)",
                      color: "var(--t2)", fontSize: ".74rem", cursor: "pointer",
                      fontFamily: "'Figtree',sans-serif", transition: "all .18s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bdr-focus)"; e.currentTarget.style.color = "var(--t1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.color = "var(--t2)"; }}
                  >Add card</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Billing Email">
                    <Input type="email" defaultValue={profile.email} />
                  </FieldGroup>
                  <FieldGroup label="GST / Tax ID (optional)">
                    <Input placeholder="e.g. 29AABCU9603R1ZX" />
                  </FieldGroup>
                </div>
              </SectionCard>

              {/* Invoice history */}
              <SectionCard>
                <CardHead title="Invoice History" sub="Download past invoices for your records." />
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".78rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                      {["Date", "Description", "Amount", "Status", "Download"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--t3)", fontWeight: 600, fontSize: ".7rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "Apr 2026", desc: "Pro Plan · Monthly", amount: "₹499", status: "Pending", statusColor: "var(--amber)" },
                      { date: "Mar 2026", desc: "Free Plan", amount: "₹0", status: "Paid", statusColor: "var(--mint)" },
                    ].map((row) => (
                      <tr key={row.date} style={{ borderBottom: "1px solid var(--bdr)" }}>
                        <td style={{ padding: "10px 10px", color: "var(--t2)" }}>{row.date}</td>
                        <td style={{ padding: "10px 10px", color: "var(--t1)" }}>{row.desc}</td>
                        <td style={{ padding: "10px 10px", color: "var(--t1)", fontWeight: 600 }}>{row.amount}</td>
                        <td style={{ padding: "10px 10px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 100, fontSize: ".68rem",
                            fontWeight: 700, background: `${row.statusColor}18`, color: row.statusColor,
                            border: `1px solid ${row.statusColor}33`,
                          }}>{row.status}</span>
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <button
                            onClick={() => toast(row.status === "Pending" ? "Upgrade to download" : "Downloading…", row.status === "Pending" ? "info" : "success")}
                            style={{ background: "none", border: "none", color: "#b0a0ff", cursor: "pointer", fontSize: ".76rem", fontFamily: "'Figtree',sans-serif" }}
                          >PDF ↓</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════ USAGE ══ */}
          {activeTab === "usage" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard>
                <CardHead title="Usage Overview" sub="Current billing period · April 2026" />

                <UsageBar label="Daily Pipeline Runs" used={0} total={1} subLabel="0 / 1 used" />
                <UsageBar label="Storage (Model artefacts)" used={124} total={500} subLabel="124 MB / 500 MB" />
                <UsageBar label="API Requests (this month)" used={1842} total={10000} subLabel="1,842 / 10,000" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {[["24", "Total Runs"], ["2.4 GB", "Data Processed"], ["91.4%", "Avg Accuracy"]].map(([v, l]) => (
                    <div key={l} style={{
                      background: "var(--bg-3)", border: "1px solid var(--bdr)",
                      borderRadius: "var(--r-md)", padding: "14px 16px", textAlign: "center",
                    }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "var(--t1)", letterSpacing: "-.03em" }}>{v}</div>
                      <div style={{ fontSize: ".68rem", color: "var(--t3)", marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {!isProUser && (
                  <div style={{
                    marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", background: "rgba(109,78,255,.06)",
                    border: "1px solid rgba(109,78,255,.2)", borderRadius: "var(--r-md)",
                  }}>
                    <div>
                      <div style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--t1)" }}>Unlock unlimited runs</div>
                      <div style={{ fontSize: ".72rem", color: "var(--t3)" }}>Upgrade to Pro for unlimited pipeline runs & storage.</div>
                    </div>
                    <button
                      onClick={() => { setActiveTab("pricing"); }}
                      style={{
                        padding: "7px 14px", background: "var(--violet)", border: "none",
                        borderRadius: "var(--r-sm)", color: "#fff", fontSize: ".76rem",
                        fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}
                    >View Plans →</button>
                  </div>
                )}
              </SectionCard>

              <SectionCard>
                <CardHead title="Usage History" sub="Pipeline runs and API calls by week." />
                <div style={{ width: "100%", height: 220, marginTop: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={USAGE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--t3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="var(--t3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--t3)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "var(--bg-3)", border: "1px solid var(--bdr)", borderRadius: 8, fontSize: 11 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: "11px", paddingTop: 10 }} />
                      <Bar yAxisId="left" dataKey="runs" name="Pipeline Runs" fill="rgba(109,78,255,0.6)" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="api" name="API Calls" stroke="var(--mint)" strokeWidth={2} dot={{ r: 3, fill: "var(--mint)" }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════ PROFILE ══ */}
          {activeTab === "profile" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard>
                <CardHead title="Profile Information" sub="Displayed in your sidebar and reports." />

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "14px 16px", background: "var(--bg-3)", border: "1px solid var(--bdr)", borderRadius: "var(--r-md)" }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--violet),var(--mint))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "#fff",
                    flexShrink: 0,
                  }}>
                    {(profile.firstName[0] || "") + (profile.lastName[0] || "")}
                  </div>
                  <div>
                    <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--t1)" }}>Profile photo</div>
                    <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: 2 }}>JPG, PNG or GIF · max 5 MB</div>
                    <button onClick={() => toast("Avatar upload coming soon", "info")} style={{ background: "none", border: "none", color: "#b0a0ff", fontSize: ".72rem", cursor: "pointer", padding: 0, marginTop: 3, fontFamily: "'Figtree',sans-serif" }}>Upload photo →</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FieldGroup label="First Name">
                    <Input value={profile.firstName} onChange={(e) => { setProfile({ ...profile, firstName: e.target.value }); markDirty(); }} />
                  </FieldGroup>
                  <FieldGroup label="Last Name">
                    <Input value={profile.lastName} onChange={(e) => { setProfile({ ...profile, lastName: e.target.value }); markDirty(); }} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Work Email">
                  <Input type="email" value={profile.email} onChange={(e) => { setProfile({ ...profile, email: e.target.value }); markDirty(); }} />
                </FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Role / Title">
                    <Input value={profile.role} onChange={(e) => { setProfile({ ...profile, role: e.target.value }); markDirty(); }} />
                  </FieldGroup>
                  <FieldGroup label="Company">
                    <Input value={profile.company} onChange={(e) => { setProfile({ ...profile, company: e.target.value }); markDirty(); }} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Bio (optional)">
                  <textarea
                    value={profile.bio}
                    onChange={(e) => { setProfile({ ...profile, bio: e.target.value }); markDirty(); }}
                    placeholder="A short description about yourself…"
                    style={{
                      width: "100%", padding: "9px 12px",
                      background: "rgba(255,255,255,.04)", border: "1px solid var(--bdr)",
                      borderRadius: "var(--r-sm)", color: "var(--t1)",
                      fontFamily: "'Figtree',sans-serif", fontSize: ".84rem",
                      outline: "none", resize: "vertical", minHeight: 72,
                      boxSizing: "border-box",
                    }}
                  />
                </FieldGroup>
                <FieldGroup label="Timezone">
                  <select
                    value={profile.timezone}
                    onChange={(e) => { setProfile({ ...profile, timezone: e.target.value }); markDirty(); }}
                    style={{
                      width: "100%", padding: "9px 12px",
                      background: "rgba(255,255,255,.04)", border: "1px solid var(--bdr)",
                      borderRadius: "var(--r-sm)", color: "var(--t1)",
                      fontFamily: "'Figtree',sans-serif", fontSize: ".84rem", outline: "none",
                    }}
                  >
                    <option value="IST">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="EST">America/New_York (EST, UTC-5)</option>
                    <option value="PST">America/Los_Angeles (PST, UTC-8)</option>
                    <option value="CET">Europe/Berlin (CET, UTC+1)</option>
                  </select>
                </FieldGroup>

                <button
                  onClick={saveProfile}
                  style={{
                    padding: "9px 20px", background: "var(--violet)", border: "none",
                    borderRadius: "var(--r-sm)", color: "#fff", fontSize: ".82rem",
                    fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                    transition: "background .2s, box-shadow .2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--violet-d)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(109,78,255,.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--violet)"; e.currentTarget.style.boxShadow = "none"; }}
                >Save Profile</button>
              </SectionCard>

              <SectionCard>
                <CardHead title="Preferences" sub="UI and experience settings." />
                <ToggleRow title="Compact mode" desc="Reduce spacing and padding across the dashboard" on={prefs.compact} onToggle={() => setPrefs({ ...prefs, compact: !prefs.compact })} />
                <ToggleRow title="Show accuracy trends on home" desc="Week-over-week accuracy sparklines on workspace cards" on={prefs.trends} onToggle={() => setPrefs({ ...prefs, trends: !prefs.trends })} />
                <ToggleRow title="Auto-open AI chat on pipeline complete" desc="Pop open the chat widget when a run finishes" on={prefs.autochat} onToggle={() => setPrefs({ ...prefs, autochat: !prefs.autochat })} />
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════ PASSWORD & 2FA ══ */}
          {activeTab === "password" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard>
                <CardHead title="Change Password" sub="Use a strong, unique password you don't use elsewhere." />
                <FieldGroup label="Current Password">
                  <Input type="password" placeholder="Enter current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="New Password">
                  <Input
                    type="password" placeholder="Min 8 characters"
                    value={pw.next}
                    onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwStrength(calcStrength(e.target.value)); }}
                  />
                  {pw.next && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                          height: 4, flex: 1, borderRadius: 100,
                          background: i <= pwStrength.score ? pwStrength.color : "var(--bdr)",
                          transition: "background .3s",
                        }} />
                      ))}
                      <span style={{ fontSize: ".7rem", color: pwStrength.color, fontWeight: 600, marginLeft: 4, whiteSpace: "nowrap" }}>{pwStrength.label}</span>
                    </div>
                  )}
                </FieldGroup>
                <FieldGroup label="Confirm New Password">
                  <Input type="password" placeholder="Repeat new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
                </FieldGroup>
                <button
                  onClick={() => {
                    if (!pw.current) { toast("Enter your current password", "err"); return; }
                    if (pw.next !== pw.confirm) { toast("Passwords do not match", "err"); return; }
                    if (pwStrength.score < 2) { toast("Password is too weak", "err"); return; }
                    toast("Password updated successfully", "success");
                    setPw({ current: "", next: "", confirm: "" });
                  }}
                  style={{
                    padding: "9px 20px", background: "var(--violet)", border: "none",
                    borderRadius: "var(--r-sm)", color: "#fff", fontSize: ".82rem",
                    fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                  }}
                >Update Password</button>
              </SectionCard>

              <SectionCard>
                <CardHead title="Two-Factor Authentication" sub="Add a second layer of protection to your account." />
                <ToggleRow
                  title="Enable 2FA via authenticator app"
                  desc="Scan a QR code with Google Authenticator or Authy"
                  on={prefs.twoFA}
                  onToggle={() => { setPrefs({ ...prefs, twoFA: !prefs.twoFA }); if (!prefs.twoFA) toast("Opening 2FA setup…", "info"); }}
                />
              </SectionCard>

              <SectionCard>
                <CardHead title="Active Sessions" sub="Devices currently signed in to your account." />
                {sessions.map((s) => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0", borderBottom: "1px solid var(--bdr)",
                    opacity: s.revoked ? .4 : 1, pointerEvents: s.revoked ? "none" : "auto",
                    transition: "opacity .3s",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--r-sm)",
                      background: "var(--bg-3)", border: "1px solid var(--bdr)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, color: "var(--t2)",
                    }}>
                      {s.name.includes("iPhone") ? "📱" : "💻"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".83rem", fontWeight: 600, color: "var(--t1)" }}>{s.name}</div>
                      <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: 2 }}>{s.meta}</div>
                    </div>
                    {s.current ? (
                      <span style={{
                        padding: "2px 8px", borderRadius: 100, fontSize: ".68rem", fontWeight: 700,
                        background: "rgba(0,229,176,.1)", color: "var(--mint)",
                        border: "1px solid rgba(0,229,176,.2)",
                      }}>Current</span>
                    ) : (
                      <button
                        onClick={() => revokeSession(s.id)}
                        style={{
                          padding: "4px 10px", background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.25)",
                          borderRadius: "var(--r-sm)", color: "var(--rose)", fontSize: ".72rem",
                          fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                        }}
                      >Revoke</button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => danger("terminate", "Terminate all sessions", "All other devices will be signed out immediately.")}
                  style={{
                    marginTop: 14, padding: "8px 16px",
                    background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.25)",
                    borderRadius: "var(--r-sm)", color: "var(--rose)", fontSize: ".8rem",
                    fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                  }}
                >Sign out of all other devices</button>
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════ NOTIFICATIONS ══ */}
          {activeTab === "notifications" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard>
                <CardHead title="Email Notifications" sub="Control which emails AnalytixAI sends you." />
                <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, padding: "4px 0" }}>Pipeline Events</div>
                <ToggleRow title="Pipeline completed" desc="Email when a run finishes with accuracy summary" on={notif.pipeDone} onToggle={() => setNotif({ ...notif, pipeDone: !notif.pipeDone })} />
                <ToggleRow title="Pipeline failed" desc="Email when a run fails with error details" on={notif.pipeFail} onToggle={() => setNotif({ ...notif, pipeFail: !notif.pipeFail })} />
                <ToggleRow title="Long-running pipeline alert" desc="Alert if a run exceeds 5 minutes" on={notif.pipeAlert} onToggle={() => setNotif({ ...notif, pipeAlert: !notif.pipeAlert })} />
                <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, padding: "12px 0 4px" }}>Account & Billing</div>
                <ToggleRow title="Daily usage digest" desc="Morning summary of yesterday's runs and accuracy" on={notif.digest} onToggle={() => setNotif({ ...notif, digest: !notif.digest })} />
                <ToggleRow title="Billing receipts" desc="Invoice and payment confirmation emails" on={notif.billing} onToggle={() => setNotif({ ...notif, billing: !notif.billing })} />
                <ToggleRow title="Free plan limit warnings" desc="Alert when you're approaching your daily limit" on={notif.limitWarn} onToggle={() => setNotif({ ...notif, limitWarn: !notif.limitWarn })} />
                <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, padding: "12px 0 4px" }}>Product Updates</div>
                <ToggleRow title="New features and releases" desc="Monthly product update newsletter" on={notif.product} onToggle={() => setNotif({ ...notif, product: !notif.product })} />
                <ToggleRow title="Tips and best practices" desc="Occasional emails with ML and analytics tips" on={notif.tips} onToggle={() => setNotif({ ...notif, tips: !notif.tips })} />
              </SectionCard>

              <SectionCard>
                <CardHead title="In-App Notifications" sub="Manage what appears in the notification bell." />
                <ToggleRow title="Pipeline status updates" desc="Real-time step progress in notification panel" on={notif.inPipeline} onToggle={() => setNotif({ ...notif, inPipeline: !notif.inPipeline })} />
                <ToggleRow title="SHAP insight alerts" desc="Notify when a new feature becomes the dominant driver" on={notif.inShap} onToggle={() => setNotif({ ...notif, inShap: !notif.inShap })} />
                <ToggleRow title="Workspace activity" desc="Alerts for shared workspace actions (Enterprise)" on={notif.inWorkspace} onToggle={() => setNotif({ ...notif, inWorkspace: !notif.inWorkspace })} />
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════ API KEYS ══ */}
          {activeTab === "apikeys" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard>
                <CardHead
                  title="API Keys"
                  sub="Use these to authenticate requests to the AnalytixAI REST API."
                  action={
                    <button
                      onClick={createKey}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", background: "var(--violet)", border: "none",
                        borderRadius: "var(--r-sm)", color: "#fff", fontSize: ".78rem",
                        fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                      }}
                    >+ New Key</button>
                  }
                />
                {apiKeys.map((k) => (
                  <div key={k.id} style={{
                    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    padding: "12px 14px", background: "var(--bg-3)",
                    border: "1px solid var(--bdr)", borderRadius: "var(--r-md)", marginBottom: 8,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--t1)" }}>{k.name}</div>
                      <div style={{ fontSize: ".68rem", color: "var(--t3)", marginTop: 2 }}>Created {k.created}</div>
                    </div>
                    <code style={{
                      fontFamily: "monospace", fontSize: ".72rem", color: "var(--t2)",
                      background: "var(--bg-2)", padding: "3px 8px", borderRadius: 4,
                      maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {k.revealed ? k.key : k.key.slice(0, -4).replace(/./g, "•") + k.key.slice(-4)}
                    </code>
                    <span style={{ fontSize: ".68rem", color: "var(--t3)", whiteSpace: "nowrap" }}>Last used {k.lastUsed}</span>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {[
                        { label: k.revealed ? "Hide" : "Reveal", action: () => revealKey(k.id), danger: false },
                        { label: "Copy", action: () => copyKey(k.key), danger: false },
                        { label: "Revoke", action: () => revokeKey(k.id, k.name), danger: true },
                      ].map((btn) => (
                        <button key={btn.label} onClick={btn.action} style={{
                          padding: "4px 10px", background: btn.danger ? "rgba(244,63,94,.1)" : "var(--sur)",
                          border: `1px solid ${btn.danger ? "rgba(244,63,94,.25)" : "var(--bdr)"}`,
                          borderRadius: "var(--r-sm)", color: btn.danger ? "var(--rose)" : "var(--t2)",
                          fontSize: ".72rem", fontWeight: 600, cursor: "pointer",
                          fontFamily: "'Figtree',sans-serif",
                        }}>{btn.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop: 14, padding: "12px 14px",
                  background: "rgba(109,78,255,.05)", border: "1px solid rgba(109,78,255,.15)",
                  borderRadius: "var(--r-md)",
                }}>
                  <div style={{ fontSize: ".76rem", fontWeight: 600, color: "#b0a0ff", marginBottom: 4 }}>API Endpoint</div>
                  <code style={{ fontFamily: "monospace", fontSize: ".74rem", color: "var(--t2)" }}>https://api.analytix.ai/v1</code>
                  <div style={{ fontSize: ".7rem", color: "var(--t3)", marginTop: 4 }}>
                    Include your key as: <code style={{ background: "var(--bg-3)", padding: "1px 6px", borderRadius: 4 }}>Authorization: Bearer sk-aai-…</code>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════════════════════════════════ DANGER ZONE ══ */}
          {activeTab === "danger" && (
            <div style={{ animation: "fadeIn .3s ease both" }}>
              <SectionCard danger>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".9rem", color: "var(--rose)", marginBottom: 4 }}>Danger Zone</div>
                <div style={{ fontSize: ".78rem", color: "var(--t3)", marginBottom: 20 }}>These actions are irreversible. Please proceed with extreme caution.</div>

                {[
                  {
                    title: "Export all data",
                    desc: "Download a ZIP of all your sessions, model outputs, and reports",
                    cta: "Export Data",
                    ctaDanger: false,
                    action: () => toast("Preparing your data export…", "info"),
                  },
                  {
                    title: "Clear all sessions",
                    desc: "Delete all pipeline runs and model artefacts. Workspaces will remain.",
                    cta: "Clear Sessions",
                    ctaDanger: true,
                    action: () => danger("clear", "Clear all sessions", "This will permanently delete all 24 pipeline runs and their model files. Workspaces and your account will be unaffected."),
                  },
                  {
                    title: "Delete all workspaces",
                    desc: "Permanently remove all workspaces and their associated sessions",
                    cta: "Delete Workspaces",
                    ctaDanger: true,
                    action: () => danger("delete-ws", "Delete all workspaces", "All 3 workspaces and their 24 sessions will be permanently deleted. This cannot be undone."),
                  },
                  {
                    title: "Terminate all other sessions",
                    desc: "Sign out all other devices immediately",
                    cta: "Terminate Sessions",
                    ctaDanger: true,
                    action: () => danger("terminate", "Terminate sessions", "All devices except your current session will be signed out."),
                  },
                  {
                    title: "Delete account",
                    desc: "Permanently delete your AnalytixAI account and all associated data",
                    cta: "Delete Account",
                    ctaDanger: true,
                    action: () => danger("delete-account", "Delete your account", "Your account, all workspaces, sessions, and data will be permanently deleted. This is irreversible."),
                  },
                ].map((item, i, arr) => (
                  <div key={item.title} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    padding: "16px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(244,63,94,.12)" : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: ".83rem", fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: ".75rem", color: "var(--t3)" }}>{item.desc}</div>
                    </div>
                    <button
                      onClick={item.action}
                      style={{
                        padding: "7px 14px", flexShrink: 0,
                        background: item.ctaDanger ? "rgba(244,63,94,.12)" : "var(--sur)",
                        border: `1px solid ${item.ctaDanger ? "rgba(244,63,94,.3)" : "var(--bdr-s)"}`,
                        borderRadius: "var(--r-sm)",
                        color: item.ctaDanger ? "var(--rose)" : "var(--t2)",
                        fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Figtree',sans-serif", whiteSpace: "nowrap",
                        transition: "all .18s",
                      }}
                      onMouseEnter={(e) => { if (item.ctaDanger) e.currentTarget.style.background = "rgba(244,63,94,.22)"; }}
                      onMouseLeave={(e) => { if (item.ctaDanger) e.currentTarget.style.background = "rgba(244,63,94,.12)"; }}
                    >{item.cta}</button>
                  </div>
                ))}
              </SectionCard>
            </div>
          )}

        </div>{/* end panels */}
      </div>{/* end layout grid */}

      {/* ── FLOATING SAVE BAR ── */}
      {dirty && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg-3)", border: "1px solid var(--bdr-s)",
          borderRadius: "var(--r-lg)", padding: "12px 20px",
          boxShadow: "0 16px 48px rgba(0,0,0,.6)", zIndex: 500,
          animation: "fadeIn .25s ease both",
        }}>
          <span style={{ fontSize: ".82rem", color: "var(--t2)" }}>
            <strong style={{ color: "var(--t1)" }}>Unsaved changes</strong> — save before leaving.
          </span>
          <button
            onClick={() => { setDirty(false); toast("Changes discarded", "info"); }}
            style={{
              padding: "6px 14px", background: "transparent", border: "1px solid var(--bdr)",
              borderRadius: "var(--r-sm)", color: "var(--t2)", fontSize: ".78rem", cursor: "pointer",
              fontFamily: "'Figtree',sans-serif",
            }}
          >Discard</button>
          <button
            onClick={saveProfile}
            style={{
              padding: "6px 16px", background: "var(--violet)", border: "none",
              borderRadius: "var(--r-sm)", color: "#fff", fontSize: ".78rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Figtree',sans-serif",
            }}
          >Save Changes</button>
        </div>
      )}
    </div>
  );
}
