/**
 * ANALYTIX.AI - Enhanced Landing Page JavaScript
 * Improved animations, interactions, and user experience
 */

// Smooth scrolling for anchor links ONLY (not external pages)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Only prevent default for hash links
        if (href && href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Enhanced scroll animations with Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Add stagger effect for grid items
            if (entry.target.classList.contains('features-grid') ||
                entry.target.classList.contains('steps-grid') ||
                entry.target.classList.contains('pricing-grid')) {
                const children = entry.target.children;
                Array.from(children).forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .feature-card, .step-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Enhanced button ripple effect
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-large').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        navbar.style.background = 'white';
        navbar.style.backdropFilter = 'none';
    }

    lastScroll = currentScroll;
});

// Pricing card hover effect
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-15px) scale(1.03)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Feature card sequential animation on hover
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < hero.offsetHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.5;
    }
});

// Console welcome message
console.log('%c🧠 ANALYTIX.AI', 'font-size: 24px; font-weight: bold; color: #6366f1;');
console.log('%cWelcome to the future of data intelligence!', 'font-size: 14px; color: #64748b;');
console.log('%cEnhanced animations and interactions loaded ✨', 'font-size: 12px; color: #10b981;');

// Performance monitoring
const perfData = performance.getEntriesByType('navigation')[0];
if (perfData) {
    console.log(`%cPage loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
        'color: #6366f1; font-weight: bold;');
}
