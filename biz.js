document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const initMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function() {
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
                
                // Toggle body overflow when menu is open
                if (navLinks.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });

            // Close menu when clicking on nav links
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
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
                    const headerHeight = document.querySelector('.glass-nav').offsetHeight;
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
                } else {
                    backToTopBtn.style.display = 'none';
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
        const featureCards = document.querySelectorAll('.feature-card');
        const algorithmCards = document.querySelectorAll('.algorithm-card');
        const successCards = document.querySelectorAll('.success-card');
        
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
        animateElements(featureCards);
        animateElements(algorithmCards);
        animateElements(successCards);
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

    // Sticky navigation on scroll
    const initStickyNav = () => {
        const header = document.querySelector('.glass-nav');
        
        if (header) {
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    };

    // Initialize all functions
    const init = () => {
        initMobileMenu();
        initSmoothScrolling();
        initBackToTop();
        initScrollAnimations();
        initContactForm();
        initStickyNav();
    };

    // Start the application
    init();
});