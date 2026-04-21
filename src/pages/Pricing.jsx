import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/api";

const PLANS = [
  {
    id: "free",
    name: "Sandbox",
    icon: "⚡",
    price: "₹0",
    period: "/ lifetime",
    desc: "Perfect for testing the neural architecture.",
    features: ["1 Pipeline Run / Day", "Basic EDA", "Standard Modeling", "7-Day History"],
    cta: "Current Plan",
    popular: false,
    accent: false,
  },
  {
    id: "pro",
    name: "Protocol",
    icon: "👑",
    price: "₹499",
    period: "/ month",
    desc: "Unlimited access for data engineers.",
    features: ["Unlimited Runs", "Deep SHAP Explainer", "AutoML Ensembles", "Priority Compute", "Forever Archive"],
    cta: "Select Protocol",
    popular: true,
    accent: true,
  },
  {
    id: "enterprise",
    name: "Vault",
    icon: "🏛️",
    price: "Custom",
    period: "",
    desc: "Dedicated clusters for organisations.",
    features: ["Private Clusters", "Custom Integrations", "On-prem Deployment", "24/7 SLA Strategy", "Audit Logs"],
    cta: "Contact Sales",
    popular: false,
    accent: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  const isProActive = user?.tier === "pro" || user?.tier === "enterprise";

  const handleUpgrade = async (planId) => {
    if (planId === "free") return;
    try {
      setLoading(planId);
      const data = await apiClient.createCheckoutSession(planId);
      if (data?.checkout_url) window.location.href = data.checkout_url;
    } catch (e) {
      console.error("Checkout failed:", e);
      alert("Failed to initialize billing. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="view active" id="view-pricing">
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 100, background: "var(--violet-g)", border: "1px solid rgba(109,78,255,.3)", color: "#b0a0ff", fontSize: ".68rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 18 }}>
          Pricing Plans
        </div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.9rem", letterSpacing: "-.04em", color: "var(--t1)", marginBottom: 10 }}>
          Upgrade Your <span style={{ background: "linear-gradient(130deg,#b39dfa,#6d4eff 50%,#00e5b0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Protocol</span>
        </h1>
        <p style={{ fontSize: ".9rem", color: "var(--t2)", maxWidth: 420, margin: "0 auto" }}>
          Choose a plan to scale your intelligence orchestration. No hidden fees.
        </p>
      </div>

      {/* ── Plan cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 900, margin: "0 auto 48px", alignItems: "center" }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.id === "free" ? !isProActive : plan.id === "pro" ? isProActive : false;
          return (
            <div
              key={plan.id}
              style={{
                background: plan.accent ? "rgba(109,78,255,.06)" : "var(--sur)",
                border: `1px solid ${plan.accent ? "rgba(109,78,255,.35)" : "var(--bdr)"}`,
                borderRadius: "var(--r-xl)",
                padding: "28px 24px",
                position: "relative",
                transform: plan.popular ? "scale(1.03)" : "scale(1)",
                boxShadow: plan.popular ? "0 0 48px rgba(109,78,255,.12)" : "none",
                transition: "transform .2s, box-shadow .2s",
                zIndex: plan.popular ? 2 : 1,
              }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--violet)", color: "#fff",
                  fontSize: ".58rem", fontWeight: 900, padding: "4px 12px",
                  borderRadius: 100, textTransform: "uppercase", letterSpacing: ".08em",
                  whiteSpace: "nowrap",
                }}>Most Popular</div>
              )}
              {isCurrent && (
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "rgba(0,229,176,.12)", color: "var(--mint)",
                  fontSize: ".58rem", fontWeight: 800, padding: "3px 8px", borderRadius: 100,
                  border: "1px solid rgba(0,229,176,.25)", textTransform: "uppercase", letterSpacing: ".06em",
                }}>Active</div>
              )}

              {/* Icon */}
              <div style={{
                width: 46, height: 46, borderRadius: "var(--r-md)", marginBottom: 16,
                background: plan.accent ? "rgba(109,78,255,.15)" : "var(--bg-3)",
                border: `1px solid ${plan.accent ? "rgba(109,78,255,.25)" : "var(--bdr)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
              }}>
                {plan.icon}
              </div>

              {/* Name + desc */}
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--t1)", marginBottom: 6 }}>{plan.name}</div>
              <div style={{ fontSize: ".76rem", color: "var(--t3)", marginBottom: 16 }}>{plan.desc}</div>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--t1)" }}>{plan.price}</span>
                {plan.period && <span style={{ fontSize: ".72rem", color: "var(--t3)", marginLeft: 4, fontWeight: 700 }}>{plan.period}</span>}
              </div>

              {/* Features */}
              <div style={{ marginBottom: 22 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", color: "var(--t2)", marginBottom: 8 }}>
                    <span style={{ color: plan.accent ? "#b0a0ff" : "var(--mint)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                style={{
                  width: "100%", padding: "11px 16px",
                  background: isCurrent ? "transparent" : plan.accent ? "var(--violet)" : "var(--bg-3)",
                  border: `1px solid ${isCurrent ? "var(--bdr)" : plan.accent ? "var(--violet)" : "var(--bdr-s)"}`,
                  borderRadius: "var(--r-md)",
                  color: isCurrent ? "var(--t3)" : plan.accent ? "#fff" : "var(--t2)",
                  fontSize: ".82rem", fontWeight: 700, cursor: isCurrent ? "default" : "pointer",
                  fontFamily: "'Figtree',sans-serif",
                  opacity: isCurrent ? .55 : 1,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent && plan.accent) { e.currentTarget.style.background = "var(--violet-d)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(109,78,255,.35)"; }
                  else if (!isCurrent) { e.currentTarget.style.borderColor = "var(--bdr-focus)"; e.currentTarget.style.color = "var(--t1)"; }
                }}
                onMouseLeave={(e) => {
                  if (plan.accent) { e.currentTarget.style.background = "var(--violet)"; e.currentTarget.style.boxShadow = "none"; }
                  else { e.currentTarget.style.borderColor = "var(--bdr-s)"; e.currentTarget.style.color = isCurrent ? "var(--t3)" : "var(--t2)"; }
                }}
              >
                {loading === plan.id ? "Initializing…" : isCurrent ? "Current Plan" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Feature comparison ── */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        background: "var(--sur)", border: "1px solid var(--bdr)", borderRadius: "var(--r-xl)",
        padding: "28px 32px",
      }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".9rem", color: "var(--t1)", marginBottom: 18, textAlign: "center" }}>Compare Plans</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: ".72rem", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Feature</th>
              {["Sandbox", "Protocol", "Vault"].map((n) => (
                <th key={n} style={{ textAlign: "center", padding: "8px 12px", fontSize: ".72rem", fontWeight: 700, color: n === "Protocol" ? "#b0a0ff" : "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Pipeline Runs",      "1/day",   "Unlimited", "Unlimited"],
              ["SHAP Explainability","—",        "✓",         "✓"],
              ["AI Chat Widget",     "—",        "✓",         "✓"],
              ["PDF Reports",        "✓",        "✓",         "✓"],
              ["Priority Compute",   "—",        "✓",         "✓"],
              ["Custom Integrations","—",        "—",         "✓"],
              ["SLA Support",        "Community","Priority",  "Dedicated"],
            ].map(([feat, ...vals], i) => (
              <tr key={feat} style={{ borderTop: "1px solid var(--bdr)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.012)" }}>
                <td style={{ padding: "11px 12px", fontSize: ".8rem", color: "var(--t2)", fontWeight: 500 }}>{feat}</td>
                {vals.map((v, vi) => (
                  <td key={vi} style={{ textAlign: "center", padding: "11px 12px", fontSize: ".8rem", color: v === "✓" ? "var(--mint)" : v === "—" ? "var(--t3)" : vi === 1 ? "#b0a0ff" : "var(--t2)", fontWeight: v === "✓" || v === "—" ? 700 : 500 }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FAQ strip ── */}
      <div style={{ maxWidth: 900, margin: "24px auto 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["Can I cancel anytime?", "Yes — cancel instantly from Settings → Plan & Billing. No lock-ins."],
          ["Is there a free trial?", "The Sandbox tier is free forever. No credit card required."],
          ["What payment methods?", "UPI, Credit/Debit cards, Net Banking — via Stripe."],
          ["Need a custom plan?", "Contact us for a tailored quote with private clusters and dedicated SLA."],
        ].map(([q, a]) => (
          <div key={q} style={{ background: "var(--sur)", border: "1px solid var(--bdr)", borderRadius: "var(--r-md)", padding: "16px 18px" }}>
            <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--t1)", marginBottom: 5 }}>{q}</div>
            <div style={{ fontSize: ".76rem", color: "var(--t3)", lineHeight: 1.6 }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
