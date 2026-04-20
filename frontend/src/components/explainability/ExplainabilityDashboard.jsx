import React, { useState, useEffect } from "react";
import FeatureImportance from "./FeatureImportance";
import WhatIfSimulator from "./WhatIfSimulator";
import { apiClient } from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

export default function ExplainabilityDashboard({ sessionId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.fetchExplainability(sessionId);
        setData(response);
        setError(null);
      } catch (err) {
        console.error("Failed to load explainability data:", err);
        setError("Explainability engine failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Decrypting Strategy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 flex items-center justify-center gap-4 bg-red-500/5 border border-red-500/10 rounded-[2rem]">
        <AlertCircle size={24} className="text-red-400" />
        <p className="text-red-400 font-bold uppercase tracking-widest text-xs">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      {/* Feature Importance - Focused Center */}
      <div className="w-full">
         <FeatureImportance features={data.features} />
      </div>
      
      {/* What-If Simulator - Focused Center */}
      <div className="w-full">
         <WhatIfSimulator 
           initialInputs={data.default_inputs} 
           categoricalOptions={data.categorical_options}
         />
      </div>
    </div>
  );
}
