import axios from "axios";

// Permanent Production API URL
const PROD_API_URL = "https://analytix-api-zl96.onrender.com";

const getBaseUrl = () => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
    return "http://127.0.0.1:8000";
  }
  return import.meta.env.VITE_API_URL || PROD_API_URL;
};

export const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Phase 11: Unified Response Handling
    // If backend returned our success_response wrapper, extract the inner data
    if (response.data?.status === "success" && "data" in response.data) {
      return response.data.data;
    }
    
    // If backend returned an error_response but with 200 OK status
    if (response.data?.status === "error") {
      const message = response.data.message || "Operation failed on backend";
      console.error(`[API Backend Error]: ${message}`);
      return Promise.reject(response.data);
    }

    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/signup pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/signup') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.response?.data?.detail || "An unexpected error occurred.";
    console.error(`[API Error]: ${message}`);
    return Promise.reject(error);
  }
);

// Endpoints
export const endpoints = {
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  me: "/auth/me",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",

  // Projects
  projects: "/projects",
  projectDetails: (id) => `/projects/${id}`,

  // Billing
  checkout: "/billing/checkout",

  // Chat
  chat: "/chat/query",

  // Upload
  upload: "/upload/dataset",
  
  // Pipeline Control
  runPipeline: (id) => `/pipeline/run/${id}`,
  
  // Status & Metadata (Phase 11 Unified Status)
  pipelineStatus: (id) => `/pipeline/status/${id}`,
  
  // History
  history: "/history/sessions",
  sessionDetails: (id) => `/history/session/${id}`,
  deleteSession: (id) => `/history/session/${id}`,

  // Downloads (Relative paths for authenticated fetch)
  downloadReport: (id) => `/download/report/${id}`,
  downloadModel: (id) => `/download/model/${id}`,
  downloadDataset: (id) => `/download/dataset/${id}`,
  
  // Explainability & Inference
  explain: (id) => `/explain/dashboard/${id}`,
  predict: (id) => `/inference/predict/${id}`,

  // Sales Intelligence
  salesAnalyze:  "/sales/analyze",
  salesSample: (projectId = null) => {
    let url = '/sales/sample';
    if (projectId) url += `?project_id=${projectId}`;
    return url;
  },
  salesForecast: (id, periods) => `/sales/forecast/${id}?periods=${periods}`,
  
  // Reporting & Export
  exportInsights: "/insights/export",
};

// Helper methods
export const apiClient = {
  uploadDataset: async (file, projectId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    let url = endpoints.upload;
    if (projectId) {
      url += `?project_id=${projectId}`;
    }
    return api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  
  startPipeline: async (id, config = { mode: "fast" }) => {
    // Sync with backend spec: pass ID in body
    const payload = { 
      dataset_id: id, 
      file_id: id,
      ...config 
    };
    return api.post(endpoints.runPipeline(id), payload);
  },
  
  fetchPipelineStatus: async (id, jobId = null) => {
    let url = endpoints.pipelineStatus(id);
    if (jobId) url += `?job_id=${jobId}`;
    return api.get(url);
  },

  // Projects
  createProject: async (data) => {
    return api.post(endpoints.projects, data);
  },
  
  fetchProjects: async () => {
    return api.get(endpoints.projects);
  },
  
  deleteProject: async (id) => {
    return api.delete(endpoints.projectDetails(id));
  },

  // Intelligence & Inference (Unified Methods)
  fetchExplainDashboard: async (id) => api.get(endpoints.explain(id)),

  predictSingle: async (id, inputs) => api.post(endpoints.predict(id), inputs),

  fetchHistory: async (projectId = null) => {
    const url = projectId ? `${endpoints.history}?project_id=${projectId}` : endpoints.history;
    return api.get(url);
  },
  
  deleteSession: async (id) => {
    return api.delete(endpoints.deleteSession(id));
  },
  
  createCheckoutSession: async (plan) => {
    return api.post(`${endpoints.checkout}?plan=${plan}`);
  },

  fetchSessionDetails: async (id) => {
    return api.get(endpoints.sessionDetails(id));
  },

  askAIContextual: async (sessionId, question) => {
    return api.post(endpoints.chat, { session_id: sessionId, question });
  },

  // ── Sales Intelligence ──────────────────────────────────────────────
  analyzeSalesFile: async (file, projectId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    let url = endpoints.salesAnalyze;
    if (projectId) url += `?project_id=${projectId}`;
    return api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  getSalesSample: async (projectId = null) => {
    return api.get(endpoints.salesSample(projectId));
  },

  getSalesForecast: async (fileId, periods = 3) => {
    return api.get(endpoints.salesForecast(fileId, periods));
  },

  // Password Recovery
  requestPasswordReset: async (email) => {
    return api.post(endpoints.forgotPassword, { email });
  },

  resetPassword: async (token, newPassword) => {
    return api.post(endpoints.resetPassword, { token, password: newPassword });
  },

  exportIntelligence: async (fileId, format = 'pdf') => {
    return api.post(`${endpoints.exportInsights}?file_id=${fileId}&format=${format}`, {}, {
      responseType: 'blob'
    });
  },
};

export default api;
