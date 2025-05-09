document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const initMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function() {
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Close menu when clicking on nav links
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
        }
    };

    // Smooth scrolling for anchor links
    const initSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Calculate offset based on header height
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // Back to top button functionality
    const initBackToTop = () => {
        const backToTopBtn = document.getElementById('back-to-top');
        
        if (backToTopBtn) {
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
        }
    };

    // Animate elements on scroll
    const initScrollAnimations = () => {
        const solutionCards = document.querySelectorAll('.solution-card');
        const statCards = document.querySelectorAll('.stat-card');
        
        const animateElements = (elements) => {
            if (elements.length > 0) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }
                    });
                }, { threshold: 0.1 });
                
                elements.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'all 0.6s ease';
                    observer.observe(card);
                });
            }
        };
        
        animateElements(solutionCards);
        animateElements(statCards);
    };

    // Enhanced hover effects for solution cards
    const initCardHoverEffects = () => {
        const solutionCards = document.querySelectorAll('.solution-card');
        
        solutionCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const solutionIcon = this.querySelector('.solution-icon');
                if (solutionIcon) {
                    solutionIcon.style.transform = 'scale(1.1) rotate(5deg)';
                    solutionIcon.style.color = 'var(--accent-color)';
                }
                
                const solutionNumber = this.querySelector('.solution-number');
                if (solutionNumber) {
                    solutionNumber.style.transform = 'scale(1.1)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const solutionIcon = this.querySelector('.solution-icon');
                if (solutionIcon) {
                    solutionIcon.style.transform = '';
                    solutionIcon.style.color = '';
                }
                
                const solutionNumber = this.querySelector('.solution-number');
                if (solutionNumber) {
                    solutionNumber.style.transform = '';
                }
            });
        });
    };

    // Animate stats counter
    const initStatsCounter = () => {
        const statNumbers = document.querySelectorAll('.stat-number');
        const statsSection = document.querySelector('.stats');
        
        if (statNumbers.length > 0 && statsSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-count'));
                        const duration = 2000;
                        const startTime = performance.now();
                        
                        const updateCount = (currentTime) => {
                            const elapsedTime = currentTime - startTime;
                            const progress = Math.min(elapsedTime / duration, 1);
                            const value = Math.floor(progress * target);
                            
                            stat.textContent = value;
                            
                            if (progress < 1) {
                                requestAnimationFrame(updateCount);
                            } else {
                                stat.textContent = target;
                            }
                        };
                        
                        requestAnimationFrame(updateCount);
                    });
                    observer.unobserve(statsSection);
                }
            }, { threshold: 0.5 });
            
            observer.observe(statsSection);
        }
    };

    // Contact form submission
    const initContactForm = () => {
        const contactForm = document.getElementById('contact-form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const service = document.getElementById('service').value;
                const message = document.getElementById('message').value.trim();
                
                // Simple validation
                if (!name || !email || !message || !service) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address');
                    return;
                }
                
                // Here you would typically send the form data to your server
                console.log('Form submitted:', { name, email, service, message });
                
                // Show success message
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                }, 1500);
            });
        }
    };

    // Initialize all functions
    const init = () => {
        initMobileMenu();
        initSmoothScrolling();
        initBackToTop();
        initScrollAnimations();
        initCardHoverEffects();
        initStatsCounter();
        initContactForm();
    };

    // Start the application
    init();
});