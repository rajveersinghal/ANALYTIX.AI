import { useEffect, useRef } from "react";
import { apiClient } from "../api/api";
import { useStore } from "../store/useStore";

export const usePipeline = () => {
  const { sessionId, status, setStatus, setStep, setMetadata, resetSession } = useStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sessionId || (status !== "processing" && status !== "completed")) {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }

    const poll = async () => {
      try {
        const response = await apiClient.fetchStatus(sessionId);
        const data = response.data;
        
        setMetadata(data);
        
        const phaseNames = [
          "upload", "profiling", "cleaning", "eda", "statistics", 
          "routing", "modeling", "tuning", "explain", "decision", "report"
        ];
        
        let activeStep = 1;
        let isAnyRunning = false;

        for (let i = 0; i < phaseNames.length; i++) {
           const phaseStatus = data.pipeline_state?.[phaseNames[i]];
           if (phaseStatus === "completed") {
              activeStep = i + 2;
           } else if (phaseStatus === "running") {
              activeStep = i + 1;
              isAnyRunning = true;
              break;
           }
        }
        setStep(activeStep > 11 ? 11 : activeStep);

        if (data.global_pipeline_status === "completed") {
          setStatus("completed");
        } else if (data.global_pipeline_status === "failed") {
          setStatus("error");
          return; // Stop polling on failure
        }

        // Adaptive Interval: Poll faster if something is running
        const nextInterval = isAnyRunning ? 2000 : 5000;
        
        // Only continue polling if not finished or if we want to keep syncing metadata
        if (status === "processing" || (status === "completed" && isAnyRunning)) {
           intervalRef.current = setTimeout(poll, nextInterval);
        }

      } catch (err) {
        console.error("Polling failed:", err);
        if (err.response?.status === 404) {
           resetSession();
        } else {
           // Retry after delay
           intervalRef.current = setTimeout(poll, 5000);
        }
      }
    };

    poll();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [sessionId, status]);

  return { sessionId, status };
};
