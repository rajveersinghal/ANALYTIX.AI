/**
 * ANALYTIX.AI API Client
 * Centralized API communication layer for frontend
 */

class APIClient {
    constructor(baseURL = 'http://localhost:8000/api/v1') {
        this.baseURL = baseURL;
    }

    /**
     * Generic request handler
     */
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Upload file with FormData
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        for (const [key, value] of Object.entries(additionalData)) {
            formData.append(key, value);
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        return await response.json();
    }

    // ==================== AUTH ====================

    async signup(email, password, fullName) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                full_name: fullName
            })
        });
    }

    async signin(email, password) {
        const response = await this.request('/auth/signin/json', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Store tokens
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);

        return response;
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('analytix_user');
    }

    // ==================== USERS ====================

    async getCurrentUser() {
        return this.request('/users/me');
    }

    async updateProfile(data) {
        return this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async saveOnboarding(onboardingData) {
        return this.request('/users/me/onboarding', {
            method: 'POST',
            body: JSON.stringify(onboardingData)
        });
    }

    async getOnboarding() {
        return this.request('/users/me/onboarding');
    }

    async getTrialStatus() {
        return this.request('/users/me/trial');
    }

    // ==================== DATASETS ====================

    async uploadDataset(file, name) {
        return this.uploadFile('/datasets/upload', file, { name });
    }

    async getDatasets() {
        return this.request('/datasets');
    }

    async getDataset(datasetId) {
        return this.request(`/datasets/${datasetId}`);
    }

    async previewDataset(datasetId, rows = 100) {
        return this.request(`/datasets/${datasetId}/preview?rows=${rows}`);
    }

    async deleteDataset(datasetId) {
        return this.request(`/datasets/${datasetId}`, {
            method: 'DELETE'
        });
    }

    // ==================== PROCESSING ====================

    async qualityCheck(datasetId) {
        return this.request(`/processing/${datasetId}/quality-check`, {
            method: 'POST'
        });
    }

    async cleanDataset(datasetId) {
        return this.request(`/processing/${datasetId}/clean`, {
            method: 'POST'
        });
    }

    async generateEDA(datasetId) {
        return this.request(`/processing/${datasetId}/eda`, {
            method: 'POST'
        });
    }

    async featureEngineering(datasetId, targetColumn, optimizeAccuracy = false) {
        return this.request(`/processing/${datasetId}/feature-engineering`, {
            method: 'POST',
            body: JSON.stringify({
                target_column: targetColumn,
                optimize_accuracy: optimizeAccuracy
            })
        });
    }

    // ==================== MODELS ====================

    async trainModel(datasetId, targetColumn, modelName = null, optimizeAccuracy = false) {
        return this.request('/models/train', {
            method: 'POST',
            body: JSON.stringify({
                dataset_id: datasetId,
                target_column: targetColumn,
                model_name: modelName,
                optimize_accuracy: optimizeAccuracy
            })
        });
    }

    async getModels() {
        return this.request('/models');
    }

    async getModel(modelId) {
        return this.request(`/models/${modelId}`);
    }

    async getModelMetrics(modelId) {
        return this.request(`/models/${modelId}/metrics`);
    }

    async downloadModel(modelId) {
        const token = localStorage.getItem('access_token');
        window.open(`${this.baseURL}/models/${modelId}/download?token=${token}`, '_blank');
    }

    async deleteModel(modelId) {
        return this.request(`/models/${modelId}`, {
            method: 'DELETE'
        });
    }

    // ==================== PREDICTIONS ====================

    async predict(modelId, inputData) {
        return this.request('/predictions/single', {
            method: 'POST',
            body: JSON.stringify({
                model_id: modelId,
                input_data: inputData
            })
        });
    }

    async batchPredict(modelId, inputDataList) {
        return this.request('/predictions/batch', {
            method: 'POST',
            body: JSON.stringify({
                model_id: modelId,
                input_data: inputDataList
            })
        });
    }

    async whatIfAnalysis(modelId, baseInput, featureToVary, variationRange) {
        return this.request('/predictions/whatif', {
            method: 'POST',
            body: JSON.stringify({
                model_id: modelId,
                base_input: baseInput,
                feature_to_vary: featureToVary,
                variation_range: variationRange
            })
        });
    }

    async getPredictionHistory(modelId = null, limit = 50) {
        const params = new URLSearchParams({ limit });
        if (modelId) params.append('model_id', modelId);
        return this.request(`/predictions/history?${params}`);
    }

    // ==================== INTELLIGENCE ====================

    async detectIntent(datasetId) {
        return this.request(`/intelligence/${datasetId}/intent`, {
            method: 'POST'
        });
    }

    async getRecommendations(datasetId, modelId = null) {
        const params = modelId ? `?model_id=${modelId}` : '';
        return this.request(`/intelligence/${datasetId}/recommendations${params}`);
    }

    async getInsights(modelId) {
        return this.request(`/intelligence/${modelId}/insights`);
    }

    async explainModel(modelId, numSamples = 100) {
        return this.request(`/intelligence/${modelId}/explain?num_samples=${numSamples}`);
    }

    async generateReport(datasetId, modelId = null) {
        const params = modelId ? `?model_id=${modelId}` : '';
        const token = localStorage.getItem('access_token');
        window.open(`${this.baseURL}/intelligence/${datasetId}/report${params}`, '_blank');
    }
}

// Create global API client instance
const api = new APIClient();
