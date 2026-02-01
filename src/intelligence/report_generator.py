import base64
import pandas as pd
import numpy as np
from datetime import datetime

def collect_deep_stats(df):
    """
    Calculates advanced statistics for every column in the dataset.
    """
    stats_list = []
    
    for col in df.columns:
        s = {"Name": col}
        s["Type"] = str(df[col].dtype)
        s["Missing"] = df[col].isnull().sum()
        s["Missing%"] = f"{(s['Missing'] / len(df)) * 100:.1f}%"
        s["Unique"] = df[col].nunique()
        
        if pd.api.types.is_numeric_dtype(df[col]):
            s["Mean"] = f"{df[col].mean():.2f}"
            s["Std"] = f"{df[col].std():.2f}"
            s["Min"] = f"{df[col].min():.2f}"
            s["Max"] = f"{df[col].max():.2f}"
            s["Skew"] = f"{df[col].skew():.2f}"
            s["Zeros"] = (df[col] == 0).sum()
        else:
            s["Mean"] = "N/A"
            s["Std"] = "N/A"
            s["Min"] = "N/A"
            s["Max"] = "N/A"
            s["Skew"] = "N/A"
            s["Zeros"] = "N/A"
            
        stats_list.append(s)
        
    return stats_list
def generate_html_report(df_name, stats, metrics, alerts, recommendations, quality_score, quality_explanation):
    """
    Generates a high-fidelity, educational HTML report.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Generate Stats Table Rows
    stats_html = ""
    for s in stats:
        stats_html += f"""
        <tr>
            <td>{s['Name']}</td>
            <td>{s['Type']}</td>
            <td>{s['Missing%']}</td>
            <td>{s['Unique']}</td>
            <td>{s['Mean']}</td>
            <td>{s['Skew']}</td>
            <td>{s['Zeros']}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Intelligence Report - {df_name}</title>
        <style>
            :root {{
                --primary: #4f46e5;
                --bg: #f8fafc;
                --card: #ffffff;
                --text: #1e293b;
            }}
            body {{ font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; margin: 0; padding: 40px; }}
            .container {{ max-width: 1000px; margin: auto; background: var(--card); padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
            header {{ border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }}
            h1 {{ color: var(--primary); margin: 0; font-size: 2.5em; }}
            h2 {{ color: #334155; margin-top: 40px; border-left: 5px solid var(--primary); padding-left: 15px; }}
            .eli5 {{ background: #eef2ff; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 5px solid #818cf8; }}
            .eli5 b {{ color: var(--primary); }}
            table {{ width: 100%; border-collapse: collapse; margin: 25px 0; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #eee; }}
            th {{ background: #f1f5f9; color: #475569; }}
            .metric-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }}
            .metric-card {{ background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }}
            .metric-value {{ font-size: 1.8em; font-weight: bold; color: var(--primary); }}
            .alert {{ background: #fef2f2; border-left: 5px solid #ef4444; padding: 15px; color: #991b1b; margin-bottom: 10px; }}
            .rec {{ background: #ecfdf5; border-left: 5px solid #10b981; padding: 15px; color: #065f46; margin-bottom: 10px; }}
            footer {{ margin-top: 60px; text-align: center; color: #94a3b8; font-size: 0.9em; }}
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🧠 Intelligence Report</h1>
                <p><b>Dataset:</b> {df_name} | <b>Ref:</b> {timestamp}</p>
            </header>

            <section>
                <h2>1. Global Readiness</h2>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Quality Score</div>
                        <div class="metric-value">{quality_score}/100</div>
                    </div>
                </div>
                <p>{quality_explanation.replace('*', '').replace('\\n', '<br>')}</p>
                <div class="eli5">
                    <b>👶 ELI5 (Readiness):</b> This score tells you if your data is "healthy" enough to teach a robot. A low score means the robot might get confused by missing or messy information.
                </div>
            </section>

            <section>
                <h2>2. Deep Statistical Profile</h2>
                <div class="eli5">
                    <b>👶 ELI5 (The Table):</b> Standard reports just show averages. We look deeper at <b>Skew</b> (is the data leaning one way?) and <b>Zeros</b> (are there too many empty spots?). Balanced data makes for better decisions.
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Feature Name</th>
                            <th>Type</th>
                            <th>Missing%</th>
                            <th>Unique</th>
                            <th>Average</th>
                            <th>Skew</th>
                            <th>Zeros</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats_html}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>3. Decision Performance</h2>
                <div class="metric-grid">
                    {''.join([f'<div class="metric-card"><div class="metric-label">{k}</div><div class="metric-value">{v:.3f}</div></div>' for k,v in metrics.items() if isinstance(v, (int, float))])}
                </div>
                <div class="eli5">
                    <b>👶 ELI5 (Performance):</b> These numbers show how often the robot was right. For example, an Accuracy of 0.90 means it's right 9 out of 10 times.
                </div>
            </section>

            <section>
                <h2>4. 🚨 Risks & Safety Alerts</h2>
                { ''.join([f"<p class='alert'><b>⚠ ALERT:</b> {a}</p>" for a in alerts]) if alerts else "<p>✅ No critical risks detected. System environment is stable.</p>" }
            </section>

            <section>
                <h2>5. 🧠 Strategic Recommendations</h2>
                { ''.join([f"<div class='rec'>💡 {r}</div>" for r in recommendations]) }
                <div class="eli5">
                    <b>👶 ELI5 (Strategy):</b> Based on everything we saw, these are the "Next Steps" you should take to win in your business.
                </div>
            </section>

            <footer>
                <p>Generated by <b>ANALYTIX.AI v2.2 Intelligence Engine</b></p>
                <p>Confidential & Proprietary</p>
            </footer>
        </div>
    </body>
    </html>
    """
    return html
def get_download_link(html_string, filename="report.html"):
    b64 = base64.b64encode(html_string.encode()).decode()
    return f'<a href="data:text/html;base64,{b64}" download="{filename}">📄 Download Full Report</a>'
