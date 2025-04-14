document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
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

    // Close mobile menu when clicking a link
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

    // Back to top button
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

    // Testimonial slider
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

    // Animate stats counter
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
        .slide-in-right {
            animation: slide-in-right 0.5s ease-out forwards;
        }
        .slide-in-left {
            animation: slide-in-left 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
});