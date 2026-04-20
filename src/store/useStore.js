import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      sessionId: null,
      projectId: null,
      setSessionId: (id) => set({ sessionId: id }),
      setProjectId: (id) => set({ projectId: id }),
      
      // Pipeline Progress State
      status: "idle", // 'idle', 'processing', 'completed'
      setStatus: (s) => set({ status: s }),
      currentStep: 1,
      totalSteps: 11,
      setStep: (step) => set({ currentStep: step }),
      
      // Workspaces State
      workspaces: [],
      setWorkspaces: (ws) => set({ workspaces: ws }),
      addWorkspace: (ws) => set((state) => ({ workspaces: [ws, ...state.workspaces] })),
      deleteWorkspace: (id) => set((state) => ({ workspaces: state.workspaces.filter(w => w.id !== id) })),
      
      // UI Preferences
      viewMode: 'grid', // 'grid' | 'list'
      setViewMode: (mode) => set({ viewMode: mode }),
      filterMode: 'all', // 'all' | 'active' | 'completed'
      setFilterMode: (mode) => set({ filterMode: mode }),
      sortMode: 'recent', // 'recent' | 'alpha' | 'sessions'
      setSortMode: (mode) => set({ sortMode: mode }),

      resetSession: () => set({ sessionId: null, status: "idle", currentStep: 1, metadata: null, error: null }),
      
      // Dataset Metadata
      metadata: null,
      error: null,
      setMetadata: (data) => set({ metadata: data }),
      setError: (msg) => set({ error: msg }),
      
      // Load Existing Session (Phase 11)
      loadSession: (data) => set({
        sessionId: data.file_id,
        status: data.pipeline_phase === "completed" ? "completed" : "processing",
        metadata: data,
        currentStep: 11 // Assume 11 if completed, or logic can be more complex
      }),
    }),
    {
      name: "analytixai-storage",
    }
  )
);
