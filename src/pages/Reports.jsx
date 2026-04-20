import React, { useState, useEffect } from "react";
import { FileText, Download, ExternalLink, RefreshCw, BookOpen, Filter } from "lucide-react";
import { apiClient, endpoints, BASE_URL } from "../api/api";
import { useNavigate } from "react-router-dom";

/* ── fallback mock data ─────────────────────────────────────────── */
const MOCK_REPORTS = [];

const SPOTLIGHT_FALLBACK = {
  summary: "No sessions available for narrative generation. Run an analysis to see AI insights here.",
  tips: [],
};

const TYPE_META = {
  insight:  { label: "Business Insight", color: "#b0a0ff", bg: "rgba(109,78,255,.1)",  border: "rgba(109,78,255,.2)"  },
  forecast: { label: "Forecast",         color: "var(--mint)", bg: "rgba(0,229,176,.08)", border: "rgba(0,229,176,.2)" },
  eda:      { label: "EDA Summary",      color: "var(--amber)", bg: "rgba(245,166,35,.08)", border: "rgba(245,166,35,.2)" },
};

function StatCard({ value, label, sub, color }) {
  return (
    <div style={{
      background: "var(--sur)", border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
      padding: "16px 18px",
    }}>
      <div style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.5rem", color: color || "var(--t1)", letterSpacing: "-.03em" }}>{value}</div>
      {sub && <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports]     = useState(MOCK_REPORTS);
  const [loading, setLoading]     = useState(true);
  const [isMock, setIsMock]       = useState(true);
  const [filter, setFilter]       = useState("all");
  const [regenerating, setRegen]  = useState(false);

  /* ── fetch real sessions ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiClient.fetchHistory();
        if (Array.isArray(data) && data.length > 0) {
          // Map session shape → report shape
          const mapped = data.map((s) => ({
            id:         s.session_id || s._id,
            file_name:  s.file_name  || s.filename || "Unknown file",
            workspace:  s.project_name || s.workspace || "Default Workspace",
            model:      s.model_type  || s.best_model || "XGBoost",
            accuracy:   typeof s.accuracy === "number" ? s.accuracy : parseFloat(s.accuracy) || 0,
            created_at: s.created_at  || s.date || new Date().toISOString(),
            type:       s.report_type || "insight",
          }));
          setReports(mapped);
          setIsMock(false);
        }
      } catch {
        /* keep mock data */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── download PDF ── */
  const downloadReport = (id) => {
    if (isMock) { alert("Connect your backend to download real reports."); return; }
    window.open(endpoints.downloadReport(id), "_blank");
  };

  /* ── view report → history detail ── */
  const viewReport = (id) => {
    if (isMock) { navigate("/pipeline"); return; }
    navigate(`/history?session=${id}`);
  };

  const filtered = reports.filter((r) => filter === "all" || r.type === filter);

  const avgAcc = reports.length
    ? (reports.reduce((s, r) => s + (r.accuracy || 0), 0) / reports.length).toFixed(1)
    : "—";

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="view active" id="view-reports">
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mint)", display: "inline-block" }} />
          <span style={{ fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t3)" }}>
            {isMock ? "Demo · Run a pipeline to see real reports" : `${reports.length} reports`}
          </span>
        </div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-.035em", color: "var(--t1)", margin: 0 }}>
          Intelligence <span style={{ background: "linear-gradient(130deg,#b39dfa,#6d4eff 50%,#00e5b0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Reports</span>
        </h1>
        <p style={{ fontSize: ".87rem", color: "var(--t2)", marginTop: 4 }}>Gemini-powered business narratives from your completed pipeline sessions.</p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        <StatCard value={reports.length} label="Total Reports" sub="All time" />
        <StatCard value={`${avgAcc}%`}   label="Avg Accuracy" sub="Across all sessions" color="var(--mint)" />
        <StatCard value={reports.filter(r => r.type === "insight").length}  label="Business Insights" sub="Insight reports" color="#b0a0ff" />
        <StatCard value={reports.filter(r => r.type === "forecast").length} label="Forecasts" sub="Forecast reports" color="var(--amber)" />
      </div>

      {/* ── Spotlight narrative ── */}
      <div style={{
        background: "var(--sur)", border: "1px solid var(--bdr)", borderRadius: "var(--r-lg)",
        padding: "20px 24px", marginBottom: 18, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,78,255,.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", background: "var(--violet-g)", border: "1px solid rgba(109,78,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={13} color="#b0a0ff" />
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".85rem", color: "var(--t1)" }}>Latest Spotlight</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: ".68rem", color: "var(--t3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Model: Gemini 1.5 Pro</span>
            <button
              onClick={() => { setRegen(true); setTimeout(() => setRegen(false), 900); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", background: "transparent",
                border: "1px solid var(--bdr)", borderRadius: "var(--r-sm)",
                color: "var(--t2)", fontSize: ".72rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Figtree',sans-serif",
                transition: "border-color .18s, color .18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bdr-s)"; e.currentTarget.style.color = "var(--t1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.color = "var(--t2)"; }}
            >
              <RefreshCw size={11} style={{ animation: regenerating ? "spin 0.8s linear infinite" : "none" }} />
              Regenerate
            </button>
          </div>
        </div>

        <p style={{
          fontSize: ".88rem", color: "var(--t1)", lineHeight: 1.7, marginBottom: 14,
          opacity: regenerating ? .4 : 1, transition: "opacity .3s",
        }}>{reports.length && !isMock ? (reports[0].summary || SPOTLIGHT_FALLBACK.summary) : SPOTLIGHT_FALLBACK.summary}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(reports.length && !isMock ? (reports[0].tips || []) : SPOTLIGHT_FALLBACK.tips).map((tip) => (
            <div key={tip.label} style={{
              padding: "12px 14px", background: "var(--bg-3)",
              border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
            }}>
              <div style={{ fontSize: ".65rem", fontWeight: 800, color: tip.color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{tip.icon} {tip.label}</div>
              <div style={{ fontSize: ".78rem", color: "var(--t2)", lineHeight: 1.55 }}>{tip.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Filter size={13} color="var(--t3)" />
        {["all", "insight", "forecast", "eda"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: "5px 14px", borderRadius: 100,
              border: `1px solid ${filter === t ? "rgba(109,78,255,.4)" : "var(--bdr)"}`,
              background: filter === t ? "var(--violet-g)" : "transparent",
              color: filter === t ? "#c4b5fd" : "var(--t3)",
              fontSize: ".74rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'Figtree',sans-serif", transition: "all .18s",
            }}
          >
            {t === "all" ? "All Reports" : TYPE_META[t]?.label || t}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "var(--t3)" }}>{filtered.length} report{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Report list ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map((i) => (
            <div key={i} style={{ height: 64, background: "var(--sur)", border: "1px solid var(--bdr)", borderRadius: "var(--r-md)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg,var(--bdr) 25%,var(--sur-h) 50%,var(--bdr) 75%)" }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((r) => {
            const t = TYPE_META[r.type] || TYPE_META.insight;
            const ext = (r.file_name || "").split(".").pop().toUpperCase();
            return (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", background: "var(--sur)",
                border: "1px solid var(--bdr)", borderRadius: "var(--r-md)",
                transition: "border-color .18s, background .18s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bdr-s)"; e.currentTarget.style.background = "var(--sur-h)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.background = "var(--sur)"; }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--r-sm)", flexShrink: 0,
                  background: ext === "CSV" ? "var(--violet-g)" : "var(--mint-g)",
                  border: `1px solid ${ext === "CSV" ? "rgba(109,78,255,.2)" : "rgba(0,229,176,.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={18} color={ext === "CSV" ? "#b0a0ff" : "var(--mint)"} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".84rem", fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.file_name}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: 2 }}>
                    {r.workspace} · {r.model} · {typeof r.accuracy === "number" ? `${r.accuracy.toFixed(1)}%` : r.accuracy} · {fmtDate(r.created_at)}
                  </div>
                </div>

                {/* Badge + actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: ".68rem", fontWeight: 700,
                    background: t.bg, color: t.color, border: `1px solid ${t.border}`,
                  }}>{t.label}</span>

                  <button
                    onClick={() => downloadReport(r.id)}
                    title="Download PDF"
                    style={{
                      width: 32, height: 32, borderRadius: "var(--r-sm)",
                      background: "transparent", border: "1px solid var(--bdr)",
                      color: "var(--t2)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .18s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--violet-g)"; e.currentTarget.style.borderColor = "rgba(109,78,255,.3)"; e.currentTarget.style.color = "#b0a0ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.color = "var(--t2)"; }}
                  >
                    <Download size={13} />
                  </button>

                  <button
                    onClick={() => viewReport(r.id)}
                    title="View Report"
                    style={{
                      width: 32, height: 32, borderRadius: "var(--r-sm)",
                      background: "transparent", border: "1px solid var(--bdr)",
                      color: "var(--t2)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .18s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--mint-g)"; e.currentTarget.style.borderColor = "rgba(0,229,176,.3)"; e.currentTarget.style.color = "var(--mint)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.color = "var(--t2)"; }}
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          border: "1px dashed var(--bdr)", borderRadius: "var(--r-xl)",
          padding: "56px 32px", textAlign: "center",
          background: "rgba(255,255,255,.01)",
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--sur)", border: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--t3)" }}>
            <FileText size={20} />
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".95rem", color: "var(--t2)", marginBottom: 6 }}>No reports match this filter</div>
          <div style={{ fontSize: ".8rem", color: "var(--t3)", marginBottom: 20 }}>Try "All Reports" or run a pipeline to generate new ones.</div>
          <button
            onClick={() => navigate("/pipeline")}
            style={{
              padding: "9px 20px", background: "var(--violet)", border: "none",
              borderRadius: "var(--r-sm)", color: "#fff", fontSize: ".82rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "'Figtree',sans-serif",
            }}
          >Run Analysis →</button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
