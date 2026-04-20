import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FileDown, Download, Terminal, Settings } from "lucide-react";
import { useStore } from "../../store/useStore";
import { endpoints } from "../../api/api";

export default function DownloadCenter() {
  const sessionId = useStore((state) => state.sessionId);

  const handleDownload = async (type) => {
    if (!sessionId) return alert("No active session identifier found.");
    
    let url = "";
    let fileName = "";
    const token = localStorage.getItem('token');

    switch(type) {
      case 'report': 
        url = endpoints.downloadReport(sessionId); 
        fileName = `AnalytixAI_Report_${sessionId.slice(-6)}.pdf`;
        break;
      case 'model': 
        url = endpoints.downloadModel(sessionId); 
        fileName = `AnalytixAI_Model_${sessionId.slice(-6)}.pkl`;
        break;
      case 'dataset': 
        url = endpoints.downloadDataset(sessionId); 
        fileName = `AnalytixAI_Cleaned_Data_${sessionId.slice(-6)}.csv`;
        break;
      default: 
        url = endpoints.downloadReport(sessionId);
        fileName = `AnalytixAI_Artifact_${sessionId.slice(-6)}.pdf`;
    }
    
    try {
      // Since these routes are JWT protected, we must fetch with headers
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Download failed. Artifact may not be ready.");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Artifact download failed. Please ensure the pipeline has completed successfully.");
    }
  };

  return (
    <Card className="p-8 space-y-8 bg-[#1e294b]/20 border-primary/20 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <Download className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest leading-none">Download Center</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Export Intelligence Artifacts</p>
        </div>
      </div>

      <div className="space-y-3">
        <DownloadOption 
          title="Analytical PDF Report" 
          desc="Narrative, charts, and quality audit trails." 
          icon={<FileDown className="text-blue-400" />}
          onClick={() => handleDownload('report')}
        />
        <DownloadOption 
          title="Production Model (.pkl)" 
          desc="Serialized binary for local prediction deployment." 
          icon={<Terminal className="text-purple-400" />}
          onClick={() => handleDownload('model')}
        />
        <DownloadOption 
          title="Cleaned Dataset (CSV)" 
          desc="Processed data after autonomous remediation." 
          icon={<Settings className="text-amber-400" />}
          onClick={() => handleDownload('dataset')}
        />
      </div>

      <div className="pt-4 border-t border-white/5">
        <Button 
          className="w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
          onClick={() => handleDownload('report')}
        >
          Export Intelligence Package <Download size={16} />
        </Button>
      </div>
    </Card>
  );
}

function DownloadOption({ title, desc, icon, onClick }) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">{desc}</p>
        </div>
      </div>
      <Download size={16} className="text-gray-600 group-hover:text-primary transition-colors" />
    </div>
  );
}
