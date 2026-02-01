/**
 * ANALYTIX.AI - Auth Pages JavaScript
 * Handles signup and signin form validation, animations, and API calls
 */

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈'; // Closed eye
        button.style.color = '#667eea';
    } else {
        input.type = 'password';
        button.textContent = '👁️'; // Open eye
        button.style.color = '#6b7280';
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    if (!strengthBar) return;

    const strength = checkPasswordStrength(password);

    strengthBar.className = 'password-strength-bar';

    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show error message
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + 'Error');

    if (input && errorDiv) {
        input.classList.add('error');
        input.classList.remove('success');
        errorDiv.textContent = '⚠ ' + message;
        errorDiv.style.display = 'flex';
    }
}

// Clear error message
function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + 'Error');

    if (input && errorDiv) {
        input.classList.remove('error');
        input.classList.add('success');
        errorDiv.style.display = 'none';
    }
}

// Handle signup form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }

    // Form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Validation
        let isValid = true;

        // Full name validation
        if (fullName.length < 2) {
            showError('fullName', 'Please enter your full name');
            isValid = false;
        } else {
            clearError('fullName');
        }

        // Email validation
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError('email');
        }

        // Password validation
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        } else if (checkPasswordStrength(password) < 3) {
            showError('password', 'Please use a stronger password');
            isValid = false;
        } else {
            clearError('password');
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        } else {
            clearError('confirmPassword');
        }

        // Terms validation
        if (!terms) {
            alert('Please accept the Terms of Service and Privacy Policy');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.textContent = '';

        try {
            // API call (using api-client.js)
            const response = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    full_name: fullName
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success! Show success animation
                submitBtn.classList.remove('loading');
                submitBtn.textContent = '✓ Account Created!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

                // Redirect to onboarding after delay
                setTimeout(() => {
                    window.location.href = 'onboarding.html';
                }, 1500);
            } else {
                // Error from API
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Create Account';

                if (data.detail) {
                    showError('email', data.detail);
                } else {
                    alert('An error occurred. Please try again.');
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Create Account';
            alert('Network error. Please check your connection and try again.');
        }
    });
}

// Handle signin form
const signinForm = document.getElementById('signinForm');
if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Validation
        let isValid = true;

        // Email validation
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError('email');
        }

        // Password validation
        if (password.length < 1) {
            showError('password', 'Please enter your password');
            isValid = false;
        } else {
            clearError('password');
        }

        if (!isValid) return;

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.textContent = '';

        try {
            // API call
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Success! Store token
                localStorage.setItem('access_token', data.access_token);
                if (remember) {
                    localStorage.setItem('remember_me', 'true');
                }

                submitBtn.classList.remove('loading');
                submitBtn.textContent = '✓ Welcome Back!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                // Error from API
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Sign In';

                if (data.detail) {
                    showError('password', 'Invalid email or password');
                } else {
                    alert('An error occurred. Please try again.');
                }
            }
        } catch (error) {
            console.error('Signin error:', error);
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Sign In';
            alert('Network error. Please check your connection and try again.');
        }
    });
}

// Input animations
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Social button handlers
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', function () {
        const provider = this.textContent.trim();
        console.log(`Social login with ${provider} clicked`);
        // Implement social login here
        alert(`Social login with ${provider} coming soon!`);
    });
});

// Console welcome
console.log('%c🧠 ANALYTIX.AI - Auth Pages', 'font-size: 18px; font-weight: bold; color: #667eea;');
console.log('%cForm validation and animations loaded', 'font-size: 12px; color: #6b7280;');
