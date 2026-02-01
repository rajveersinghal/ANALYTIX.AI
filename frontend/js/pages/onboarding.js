/**
 * ANALYTIX.AI - Enhanced Onboarding JavaScript
 * Multi-step wizard with backend integration
 */

// Authentication check - DISABLED FOR TESTING PHASE
// Uncomment in production to require authentication
/*
if (!localStorage.getItem('access_token')) {
    window.location.href = 'signin.html';
}
*/

// Onboarding state
let currentStep = 1;
const totalSteps = 3;
const onboardingData = {
    goal: '',
    experience_level: '',
    dataset_choice: ''
};

// Update progress bar and step indicators
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    // Update step circles
    for (let i = 1; i <= totalSteps; i++) {
        const circle = document.getElementById(`circle-${i}`);
        const step = document.getElementById(`progress-step-${i}`);
        const label = step.querySelector('.step-label');

        if (i < currentStep) {
            circle.classList.add('completed');
            circle.classList.remove('active');
            circle.innerHTML = '✓';
            label.classList.add('active');
        } else if (i === currentStep) {
            circle.classList.add('active');
            circle.classList.remove('completed');
            circle.innerHTML = i;
            label.classList.add('active');
        } else {
            circle.classList.remove('active', 'completed');
            circle.innerHTML = i;
            label.classList.remove('active');
        }
    }
}

// Show specific step
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show current step
    document.getElementById(`step${step}`).classList.add('active');

    // Update buttons
    document.getElementById('prevBtn').style.display = step === 1 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').style.display = step === totalSteps ? 'none' : 'inline-block';
    document.getElementById('finishBtn').style.display = step === totalSteps ? 'inline-block' : 'none';

    updateProgress();
}

// Validate current step
function validateStep(step) {
    let fieldName, errorMessage;

    if (step === 1) {
        fieldName = 'goal';
        errorMessage = 'Please select your primary goal';
    } else if (step === 2) {
        fieldName = 'experience';
        errorMessage = 'Please select your experience level';
    } else if (step === 3) {
        fieldName = 'dataset';
        errorMessage = 'Please select how you want to start';
    }

    const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
    if (!selected) {
        showNotification(errorMessage, 'error');
        return false;
    }

    // Save selection
    if (step === 1) onboardingData.goal = selected.value;
    if (step === 2) onboardingData.experience_level = selected.value;
    if (step === 3) onboardingData.dataset_choice = selected.value;

    return true;
}

// Next step
function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    }
}

// Previous step
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Skip onboarding
function skipOnboarding() {
    if (confirm('Are you sure you want to skip the setup? You can always configure this later in settings.')) {
        localStorage.setItem('analytix_onboarding_skipped', 'true');
        window.location.href = 'dashboard.html';
    }
}

// Finish onboarding
async function finishOnboarding() {
    if (!validateStep(currentStep)) {
        return;
    }

    // Show loading screen
    const finishBtn = document.getElementById('finishBtn');
    finishBtn.disabled = true;
    finishBtn.textContent = 'Saving...';

    document.getElementById('loadingScreen').style.display = 'flex';

    try {
        // Save onboarding data to backend
        const token = localStorage.getItem('access_token');

        if (token) {
            // If authenticated, save to backend
            const response = await fetch('http://localhost:8000/api/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(onboardingData)
            });

            if (!response.ok) {
                throw new Error('Failed to save onboarding data');
            }

            console.log('✅ Onboarding data saved to backend');
        } else {
            // For testing without auth, just save to localStorage
            console.log('📝 Saving onboarding data locally (no auth)');
        }

        // Save to localStorage
        localStorage.setItem('analytix_onboarding_data', JSON.stringify(onboardingData));
        localStorage.setItem('analytix_onboarding_complete', 'true');

        console.log('Onboarding completed:', onboardingData);

        // Show success message
        showNotification('Setup complete! Redirecting to dashboard...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Error saving onboarding:', error);
        document.getElementById('loadingScreen').style.display = 'none';
        finishBtn.disabled = false;
        finishBtn.textContent = 'Get Started 🚀';
        showNotification('Failed to save. Redirecting anyway...', 'warning');

        // Still redirect even if save fails (for testing)
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add click handlers to option cards
document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', function () {
        // Remove selected class from siblings
        const siblings = this.parentElement.querySelectorAll('.option-card');
        siblings.forEach(sibling => sibling.classList.remove('selected'));

        // Add selected class to clicked card
        this.classList.add('selected');

        // Check the radio button
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    });
});

// Initialize
showStep(1);

console.log('✨ Enhanced onboarding system loaded with backend integration');
