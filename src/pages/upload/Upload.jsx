import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, BASE_URL } from '../../api/api';
import UploadBox from '../../components/upload/UploadBox';
import PipelineSteps from '../../components/upload/PipelineSteps';
import { Play, ArrowRight, AlertCircle, UploadCloud, Info } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [datasetId, setDatasetId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [pipelineState, setPipelineState] = useState({
    step: 'idle',
    progress: 0,
    status: ''
  });
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      console.log("[Upload] Initiating ingestion for file:", file.name);
      const response = await apiClient.uploadDataset(file);
      console.log("[Upload] Ingestion response received. Keys:", Object.keys(response));
      
      // Handle various potential response structures (Backend uses file_id)
      const id = response.file_id || 
                 response.dataset_id || 
                 response.id || 
                 response.dataset?.id || 
                 (response.data && (response.data.file_id || response.data.dataset_id || response.data.id));
      
      if (id) {
        setDatasetId(id);
        console.log("[Upload] Dataset ID successfully established (file_id):", id);
      } else {
        const keys = Object.keys(response).join(", ");
        throw new Error(`Ingestion completed but no dataset ID was found in the response. Received keys: [${keys}]`);
      }
      
      setIsUploading(false);
    } catch (err) {
      console.error("[Upload] Ingestion failure:", err);
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || "An unexpected error occurred during ingestion.";
      setError(msg);
      setIsUploading(false);
    }
  };

  const startAnalysis = async () => {
    if (!datasetId) return;
    setError(null);
    // Capture the datasetId at call time to avoid stale closure
    const currentDatasetId = datasetId;
    console.log("[Upload] Triggering analysis for dataset:", currentDatasetId);
    setPipelineState({ step: 'upload', progress: 5, status: 'Initializing analysis engine...' });
    
    try {
      const response = await apiClient.startPipeline(currentDatasetId, { 
        target_column: null, 
        mode: "fast" 
      });
      console.log("[Upload] Pipeline start response:", response);
      
      const jobId = response.job_id || 
                 response.run_id || 
                 response.id || 
                 (response.data && (response.data.job_id || response.data.run_id || response.data.id));
      
      if (jobId) {
        setJobId(jobId);
        // Pass datasetId explicitly — avoids stale closure capturing null
        connectWebSocket(jobId, currentDatasetId);
      } else {
        throw new Error("Pipeline started but no job ID was established by the engine.");
      }
    } catch (err) {
      console.error("[Upload] Pipeline trigger failed:", err);
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || "The pipeline failed to start. Please check your data format.";
      setError(msg);
      setPipelineState({ step: 'idle', progress: 0, status: '' });
    }
  };

  // persistentDatasetId is passed explicitly to avoid stale React closure
  const connectWebSocket = (jobId, persistentDatasetId) => {
    const wsUrl = BASE_URL.replace('http', 'ws') + `/ws/${jobId}`;
    console.log(`[Upload] Connecting WebSocket for job=${jobId}, will navigate to dataset=${persistentDatasetId}`);
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPipelineState({
          step: data.current_step || data.step || 'upload',
          progress: data.progress || 0,
          status: data.ai_thinking || data.status || ''
        });

        const isDone = data.status === 'completed' || data.current_step === 'completed';
        if (isDone) {
          console.log(`[Upload] Pipeline complete. Navigating to insights for dataset: ${persistentDatasetId}`);
          setTimeout(() => {
            // Use persistentDatasetId — the permanent DB key, NOT the job_id
            navigate(`/app/insights?job_id=${persistentDatasetId}`);
          }, 1500);
        }
      } catch (e) {
        console.error('[Upload] WebSocket message parse error:', e);
      }
    };

    socketRef.current.onerror = (e) => {
      console.error('[Upload] WebSocket error:', e);
      setError("Connection to analysis engine lost. Your data is still processing.");
    };

    socketRef.current.onclose = () => {
      console.log('[Upload] WebSocket closed.');
    };
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-4">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Upload Dataset</h1>
        <p className="text-sm text-zinc-500">Ingest your raw data to trigger autonomous AI analysis.</p>
      </header>

      <div className="space-y-16">
        {/* Step 1: Selection & Upload */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[11px] font-bold text-zinc-400">1</div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Select Data Source</h3>
            </div>
            {datasetId && (
              <span className="badge-linear badge-success animate-in fade-in zoom-in duration-300">File Ingested</span>
            )}
          </div>
          
          <div className={datasetId ? 'opacity-50 pointer-events-none transition-opacity' : ''}>
            <UploadBox 
              selectedFile={file} 
              onFileSelect={(f) => { setFile(f); setError(null); }}
              onClear={() => { setFile(null); setDatasetId(null); setJobId(null); }}
            />
          </div>

          {file && !datasetId && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-linear flex items-center gap-2 px-12 py-3 rounded-full"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Ingesting...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Confirm Ingestion
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Pipeline Control */}
        {datasetId && (
          <section className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[11px] font-bold text-zinc-400">2</div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Analysis Pipeline</h3>
            </div>

            {!jobId ? (
              <div className="card-linear bg-white/[0.01] border-white/[0.05] p-12 text-center">
                <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/[0.05]">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                </div>
                <h4 className="text-lg font-medium text-white mb-3">Ready for Neural Analysis</h4>
                <p className="text-zinc-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                  The engine will perform autonomous EDA, cleaning, and context-aware model training.
                </p>
                <button 
                  onClick={startAnalysis}
                  className="btn-linear flex items-center gap-2 px-16 py-4 mx-auto rounded-full text-base"
                >
                  <Play size={18} />
                  Trigger AI Workflow
                </button>
              </div>
            ) : (
              <div className="card-linear p-10 bg-white/[0.01]">
                <PipelineSteps 
                  currentStep={pipelineState.step}
                  progress={pipelineState.progress}
                  status={pipelineState.status}
                />
              </div>
            )}
          </section>
        )}

        {/* Improved Error Handling */}
        {error && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-4 text-rose-400 animate-in shake duration-500">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold">Analysis Interrupted</p>
              <p className="text-[13px] text-rose-400/80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Global UX Note */}
        <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <Info size={16} className="text-zinc-500" />
          <p className="text-[12px] text-zinc-500">All data is processed securely in your isolated neural environment.</p>
        </div>
      </div>
    </div>
  );
}
