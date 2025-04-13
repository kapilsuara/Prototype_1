document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle with animation
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Add animation class
            if (navLinks.classList.contains('active')) {
                navLinks.style.animation = 'slideInRight 0.3s ease-out forwards';
            } else {
                navLinks.style.animation = 'slideOutRight 0.3s ease-out forwards';
            }
        });
    }

    // Close mobile menu when clicking a link (with animation)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                }, 300);
            }
        });
    });

    // Smooth scrolling for anchor links with offset for fixed header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#auth-modals') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.glass-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Back to top button with fade animation
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
            setTimeout(() => {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.transform = 'translateY(0)';
            }, 10);
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                backToTopBtn.style.display = 'none';
            }, 300);
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Enhanced testimonial slider with touch support
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderContainer = document.querySelector('.testimonials-slider');

    if (testimonialCards.length > 0) {
        function showTestimonial(index) {
            testimonialCards.forEach((card, i) => {
                card.classList.remove('active', 'slide-in-right', 'slide-in-left');
                if (i === index) {
                    card.classList.add('active');
                    
                    // Add direction-based animation
                    const direction = index > currentIndex ? 'slide-in-right' : 'slide-in-left';
                    card.classList.add(direction);
                }
            });
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentIndex = index;
        }

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showTestimonial(index));
        });

        // Previous/next buttons
        if (prevBtn) prevBtn.addEventListener('click', () => {
            let newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = testimonialCards.length - 1;
            showTestimonial(newIndex);
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            let newIndex = currentIndex + 1;
            if (newIndex >= testimonialCards.length) newIndex = 0;
            showTestimonial(newIndex);
        });

        // Touch support for slider
        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, {passive: true});

            sliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, {passive: true});

            function handleSwipe() {
                const difference = touchStartX - touchEndX;
                if (difference > 50) {
                    // Swipe left - next
                    let newIndex = currentIndex + 1;
                    if (newIndex >= testimonialCards.length) newIndex = 0;
                    showTestimonial(newIndex);
                } else if (difference < -50) {
                    // Swipe right - previous
                    let newIndex = currentIndex - 1;
                    if (newIndex < 0) newIndex = testimonialCards.length - 1;
                    showTestimonial(newIndex);
                }
            }

            // Auto-rotate testimonials with pause on hover
            let testimonialInterval = setInterval(() => {
                let newIndex = currentIndex + 1;
                if (newIndex >= testimonialCards.length) newIndex = 0;
                showTestimonial(newIndex);
            }, 5000);

            sliderContainer.addEventListener('mouseenter', () => {
                clearInterval(testimonialInterval);
            });
            
            sliderContainer.addEventListener('mouseleave', () => {
                clearInterval(testimonialInterval);
                testimonialInterval = setInterval(() => {
                    let newIndex = currentIndex + 1;
                    if (newIndex >= testimonialCards.length) newIndex = 0;
                    showTestimonial(newIndex);
                }, 5000);
            });
        }
    }

    // Animate stats counter with improved performance
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats');
    
    if (statNumbers.length > 0 && statsSection) {
        function animateStats() {
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                const duration = 2000;
                const startTime = performance.now();
                
                const updateCount = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);
                    const value = Math.floor(progress * target);
                    
                    stat.textContent = value.toLocaleString();
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.textContent = target.toLocaleString();
                    }
                };
                
                requestAnimationFrame(updateCount);
            });
        }
        
        // Intersection Observer for stats animation
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateStats();
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }

    // Enhanced password strength indicator
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strengthBar = this.closest('.form-group').querySelector('.strength-bar');
            const strengthText = this.closest('.form-group').querySelector('.strength-text');
            const password = this.value;
            let strength = 0;
            
            // Check password length
            if (password.length > 0) strength += 20;
            if (password.length >= 8) strength += 20;
            
            // Check for character variety
            if (/[A-Z]/.test(password)) strength += 20; // Uppercase
            if (/[a-z]/.test(password)) strength += 10; // Lowercase
            if (/[0-9]/.test(password)) strength += 20; // Numbers
            if (/[^A-Za-z0-9]/.test(password)) strength += 30; // Special chars
            
            // Cap at 100
            strength = Math.min(strength, 100);
            
            // Update strength bar with smooth transition
            strengthBar.style.transition = 'width 0.3s ease, background-color 0.3s ease';
            strengthBar.style.width = strength + '%';
            
            // Update strength text and color
            if (strength < 40) {
                strengthBar.style.backgroundColor = 'var(--error-color)';
                strengthText.textContent = 'Weak';
            } else if (strength < 70) {
                strengthBar.style.backgroundColor = 'var(--warning-color)';
                strengthText.textContent = 'Medium';
            } else {
                strengthBar.style.backgroundColor = 'var(--success-color)';
                strengthText.textContent = 'Strong';
            }
        });
    }

    // Modal Management System for Login/Signup
    const initAuthModals = () => {
        // Get all modal elements
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const successModal = document.getElementById('success-modal');
        const errorModal = document.getElementById('error-modal');
        
        // Get all trigger buttons
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const ctaSignupBtn = document.getElementById('cta-signup-btn');
        const ctaLoginLink = document.getElementById('cta-login-link');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');
        
        // Get all close buttons
        const closeBtns = document.querySelectorAll('.close-btn');
        const successCloseBtn = document.getElementById('success-close-btn');
        const errorCloseBtn = document.getElementById('error-close-btn');

        // Function to open a modal
        const openModal = (modal) => {
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                // Add animation
                modal.querySelector('.modal-content').classList.add('animate__animated', 'animate__fadeIn');
            }
        };

        // Function to close a modal
        const closeModal = (modal) => {
            if (modal) {
                // Add fade out animation
                modal.querySelector('.modal-content').classList.remove('animate__fadeIn');
                modal.querySelector('.modal-content').classList.add('animate__fadeOut');
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                    modal.querySelector('.modal-content').classList.remove('animate__fadeOut');
                }, 300);
            }
        };

        // Event listeners for opening modals
        if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
        if (signupBtn) signupBtn.addEventListener('click', () => openModal(signupModal));
        if (ctaSignupBtn) ctaSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(signupModal);
        });
        if (ctaLoginLink) ctaLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });

        // Event listeners for switching between modals
        if (switchToSignup) switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            setTimeout(() => openModal(signupModal), 300);
        });
        
        if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(signupModal);
            setTimeout(() => openModal(loginModal), 300);
        });

        // Event listeners for closing modals
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });

        if (successCloseBtn) successCloseBtn.addEventListener('click', () => closeModal(successModal));
        if (errorCloseBtn) errorCloseBtn.addEventListener('click', () => closeModal(errorModal));

        // Close modal when clicking outside of modal content
        [loginModal, signupModal, successModal, errorModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal(modal);
                    }
                });
            }
        });

        // Close modal with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style="display: block;"]');
                if (openModal) closeModal(openModal);
            }
        });
    };

    // Initialize all components
    initAuthModals();

    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slide-in-right {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-left {
            from { transform: translateX(-50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes animate__fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes animate__fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
        .slide-in-right {
            animation: slide-in-right 0.5s ease-out forwards;
        }
        .slide-in-left {
            animation: slide-in-left 0.5s ease-out forwards;
        }
        .animate__fadeIn {
            animation: animate__fadeIn 0.3s ease-out forwards;
        }
        .animate__fadeOut {
            animation: animate__fadeOut 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    // Add subtle hover effects to service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});