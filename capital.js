document.addEventListener('DOMContentLoaded', function() {
    // Debugging initialization
    console.log('[Debug] MoneyChoice Capital initializing...');

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            console.log('[Debug] Mobile menu button clicked');
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Toggle body overflow when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                console.log('[Debug] Mobile menu opened');
            } else {
                document.body.style.overflow = '';
                console.log('[Debug] Mobile menu closed');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
                console.log('[Debug] Mobile menu closed after navigation');
            }
        });
    });

    // Smooth scrolling for anchor links with offset for fixed header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                console.log(`[Debug] Scrolling to: ${targetId}`);
                
                const headerHeight = document.querySelector('.glass-nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Back to top button with progress indicator
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollPosition / docHeight) * 100;
            
            if (scrollPosition > 300) {
                backToTopBtn.style.display = 'flex';
                backToTopBtn.title = `Scrolled ${Math.round(scrollPercent)}%`;
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            console.log('[Debug] Scrolling to top');
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Animate stats counter with improved performance
    const statNumbers = document.querySelectorAll('.stat-value[data-count]');
    
    function animateStats() {
        console.log('[Debug] Animating stats counters');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();
            
            const updateCount = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const currentValue = Math.floor(progress * target);
                
                stat.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            };
            
            requestAnimationFrame(updateCount);
        });
    }
    
    // Intersection Observer for scroll animations
    const createObserver = (elements, callback, options = {}) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        elements.forEach(element => observer.observe(element));
    };

    // Animate elements when they come into view
    const animatedElements = document.querySelectorAll('[data-animation]');
    createObserver(animatedElements, (element) => {
        const animation = element.getAttribute('data-animation');
        const delay = element.getAttribute('data-delay') || 0;
        
        element.style.animationDelay = `${delay}ms`;
        element.classList.add(animation);
        console.log(`[Debug] Animating element with: ${animation}`);
        
        // Remove the attribute to prevent re-animation
        element.removeAttribute('data-animation');
    }, { threshold: 0.1 });

    // Stats counter observer
    const statsSection = document.querySelector('.about-section');
    if (statsSection && statNumbers.length > 0) {
        createObserver([statsSection], animateStats, { threshold: 0.5 });
    }

    // Testimonial slider with enhanced controls
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentIndex = 0;
    let testimonialInterval;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;

    function showTestimonial(index) {
        console.log(`[Debug] Showing testimonial ${index}`);
        
        testimonialCards.forEach((card, i) => {
            card.classList.remove('active');
            if (i === index) {
                card.classList.add('active');
            }
        });
        
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) {
                dot.classList.add('active');
            }
        });
        
        currentIndex = index;
    }

    function nextSlide() {
        let newIndex = currentIndex + 1;
        if (newIndex >= testimonialCards.length) newIndex = 0;
        showTestimonial(newIndex);
    }

    function prevSlide() {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = testimonialCards.length - 1;
        showTestimonial(newIndex);
    }

    // Touch event handlers for swipe
    function touchStart(index) {
        return function(e) {
            isDragging = true;
            startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            animationID = requestAnimationFrame(animation);
            e.preventDefault();
        };
    }

    function touchMove(e) {
        if (isDragging) {
            const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function touchEnd() {
        cancelAnimationFrame(animationID);
        isDragging = false;
        
        if (currentTranslate < -50) {
            nextSlide();
        } else if (currentTranslate > 50) {
            prevSlide();
        }
        
        currentTranslate = 0;
        prevTranslate = 0;
    }

    function animation() {
        // This would control the sliding animation during drag
        animationID = requestAnimationFrame(animation);
    }

    // Initialize slider controls
    if (testimonialCards.length > 0) {
        // Add event listeners to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonial(index);
                resetInterval();
            });
        });

        // Add navigation controls
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });

            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
        }

        // Add touch events for mobile swipe
        const slider = document.querySelector('.testimonials-slider');
        if (slider) {
            slider.addEventListener('touchstart', touchStart, { passive: false });
            slider.addEventListener('touchmove', touchMove, { passive: false });
            slider.addEventListener('touchend', touchEnd);
            slider.addEventListener('mousedown', touchStart);
            slider.addEventListener('mousemove', touchMove);
            slider.addEventListener('mouseup', touchEnd);
            slider.addEventListener('mouseleave', touchEnd);
        }

        // Auto-rotate testimonials
        function startInterval() {
            testimonialInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        }

        function resetInterval() {
            clearInterval(testimonialInterval);
            startInterval();
        }

        startInterval();

        // Pause auto-rotation on hover
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                clearInterval(testimonialInterval);
            });
            
            slider.addEventListener('mouseleave', () => {
                startInterval();
            });
        }
    }

    // Sticky navigation with shadow effect
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

    // Floating elements animation controller
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach(element => {
        element.style.animationPlayState = 'running';
        
        // Pause animation when not in view for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    element.style.animationPlayState = 'running';
                } else {
                    element.style.animationPlayState = 'paused';
                }
            });
        });
        
        observer.observe(element);
    });

    // Debugging: Log all animations when they start
    document.addEventListener('animationstart', function(e) {
        console.log(`[Debug] Animation started: ${e.animationName}`);
    }, false);

    console.log('[Debug] MoneyChoice Capital initialized successfully');
});

// Helper function for debouncing
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}