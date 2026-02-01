/**
 * Dashboard JavaScript
 * Loads user data, stats, and recent activity
 */

// Check authentication - DISABLED FOR TESTING PHASE
// Uncomment in production to require authentication
/*
if (!localStorage.getItem('access_token')) {
    window.location.href = 'signin.html';
}
*/

// Load dashboard data
async function loadDashboard() {
    try {
        // Get user profile
        const user = await api.getCurrentUser();
        document.getElementById('userName').textContent = user.full_name;

        // Get trial status
        const trial = await api.getTrialStatus();
        if (trial.is_trial && !trial.is_expired) {
            document.getElementById('trialBanner').style.display = 'block';
            document.getElementById('trialDays').textContent = trial.days_remaining;
        }

        // Get datasets
        const datasets = await api.getDatasets();
        document.getElementById('datasetCount').textContent = datasets.total;

        // Calculate average quality score
        if (datasets.total > 0) {
            const avgQuality = datasets.datasets.reduce((sum, d) => sum + (d.quality_score || 0), 0) / datasets.total;
            document.getElementById('qualityScore').textContent = avgQuality.toFixed(0);
        }

        // Get models
        const models = await api.getModels();
        document.getElementById('modelCount').textContent = models.total;

        // Get prediction history
        const predictions = await api.getPredictionHistory();
        document.getElementById('predictionCount').textContent = predictions.total;

        // Load recent activity
        loadRecentActivity(datasets.datasets, models.models);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Disabled for testing - don't redirect on auth errors
        /*
        if (error.message.includes('401') || error.message.includes('credentials')) {
            localStorage.clear();
            window.location.href = 'signin.html';
        }
        */
    }
}

function loadRecentActivity(datasets, models) {
    const activityList = document.getElementById('recentActivity');
    const activities = [];

    // Add recent datasets
    datasets.slice(0, 3).forEach(dataset => {
        activities.push({
            type: 'dataset',
            title: `Uploaded dataset: ${dataset.name}`,
            description: `${dataset.rows} rows, ${dataset.columns} columns`,
            time: new Date(dataset.created_at)
        });
    });

    // Add recent models
    models.slice(0, 3).forEach(model => {
        activities.push({
            type: 'model',
            title: `Trained model: ${model.name}`,
            description: `${model.model_type} - ${model.problem_type}`,
            time: new Date(model.created_at)
        });
    });

    // Sort by time
    activities.sort((a, b) => b.time - a.time);

    // Display activities
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="loading">No recent activity. Start by uploading a dataset!</p>';
    } else {
        activityList.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="time">${formatTime(activity.time)}</span>
            </div>
        `).join('');
    }
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

async function logout() {
    try {
        await api.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    window.location.href = 'index.html';
}

// Load dashboard on page load
loadDashboard();
