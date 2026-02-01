/**
 * Authentication JavaScript with Real API Integration
 * Connects to FastAPI backend for signup/signin
 */

// Password toggle
document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function () {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
    });
});

// Password strength checker (for signup)
const passwordInput = document.getElementById('password');
if (passwordInput && document.getElementById('strengthFill')) {
    passwordInput.addEventListener('input', function () {
        const password = this.value;
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        strengthFill.className = 'strength-fill';
        if (strength === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Enter a password';
        } else if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (strength === 3) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Medium password';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
        }
    });
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(inputId) {
    const errorElement = document.getElementById(inputId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function showLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
}

function hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
}

// Sign Up Form with Real API
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        clearError('name');
        clearError('email');
        clearError('password');

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const terms = document.getElementById('terms').checked;

        let isValid = true;

        // Validate name
        if (name.length < 2) {
            showError('name', 'Please enter your full name');
            isValid = false;
        }

        // Validate email
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        // Validate terms
        if (!terms) {
            alert('Please accept the Terms of Service and Privacy Policy');
            isValid = false;
        }

        if (isValid) {
            const submitBtn = this.querySelector('button[type="submit"]');
            showLoading(submitBtn);

            try {
                // Call API
                const response = await api.signup(email, password, name);

                console.log('Signup successful:', response);

                // Store user info
                localStorage.setItem('analytix_user', JSON.stringify(response.user));

                // Redirect to onboarding
                window.location.href = 'onboarding.html';

            } catch (error) {
                console.error('Signup error:', error);
                hideLoading(submitBtn);

                if (error.message.includes('already registered')) {
                    showError('email', 'Email already registered. Please sign in.');
                } else {
                    showError('email', error.message || 'Signup failed. Please try again.');
                }
            }
        }
    });
}

// Sign In Form with Real API
const signinForm = document.getElementById('signinForm');
if (signinForm) {
    signinForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous errors
        clearError('email');
        clearError('password');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        let isValid = true;

        // Validate email
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (password.length === 0) {
            showError('password', 'Please enter your password');
            isValid = false;
        }

        if (isValid) {
            const submitBtn = this.querySelector('button[type="submit"]');
            showLoading(submitBtn);

            try {
                // Call API
                const response = await api.signin(email, password);

                console.log('Signin successful:', response);

                // Store user info
                localStorage.setItem('analytix_user', JSON.stringify(response.user));

                // Check if onboarding is complete
                try {
                    const onboarding = await api.getOnboarding();
                    if (onboarding) {
                        // Onboarding complete, go to dashboard
                        window.location.href = 'dashboard.html';
                    } else {
                        // No onboarding, redirect to onboarding
                        window.location.href = 'onboarding.html';
                    }
                } catch (error) {
                    // No onboarding data, redirect to onboarding
                    window.location.href = 'onboarding.html';
                }

            } catch (error) {
                console.error('Signin error:', error);
                hideLoading(submitBtn);

                if (error.message.includes('401') || error.message.includes('credentials')) {
                    showError('email', 'Invalid email or password');
                } else {
                    showError('email', error.message || 'Sign in failed. Please try again.');
                }
            }
        }
    });
}

// Social login buttons (placeholder)
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', function () {
        const provider = this.textContent.trim();
        alert(`${provider} login coming soon!`);
    });
});

// Real-time validation
const emailInputs = document.querySelectorAll('input[type="email"]');
emailInputs.forEach(input => {
    input.addEventListener('blur', function () {
        if (this.value.trim() && !validateEmail(this.value.trim())) {
            showError(this.id, 'Please enter a valid email address');
        } else {
            clearError(this.id);
        }
    });
});

console.log('🔐 Authentication system loaded with API integration');
