document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    html.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Mobile menu toggle
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
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                targetElement.scrollIntoView({
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

    // Animate stats counter
    const statNumbers = document.querySelectorAll('.stat-value[data-count]');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCount = () => {
                current += step;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateCount();
        });
    }
    
    // Only animate when stats section is in view
    const statsSection = document.querySelector('.about-section');
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateStats();
            observer.unobserve(statsSection);
        }
    });
    
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Testimonial slider
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentIndex = 0;
    let testimonialInterval;

    function showTestimonial(index) {
        // Hide all testimonials and remove active class from dots
        testimonialCards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show the selected testimonial and update dot
        testimonialCards[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextTestimonial() {
        let newIndex = currentIndex + 1;
        if (newIndex >= testimonialCards.length) newIndex = 0;
        showTestimonial(newIndex);
    }

    function prevTestimonial() {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = testimonialCards.length - 1;
        showTestimonial(newIndex);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(testimonialInterval);
            showTestimonial(index);
            startAutoRotation();
        });
    });

    // Previous/next buttons
    prevBtn.addEventListener('click', () => {
        clearInterval(testimonialInterval);
        prevTestimonial();
        startAutoRotation();
    });

    nextBtn.addEventListener('click', () => {
        clearInterval(testimonialInterval);
        nextTestimonial();
        startAutoRotation();
    });

    // Auto-rotate testimonials
    function startAutoRotation() {
        testimonialInterval = setInterval(() => {
            nextTestimonial();
        }, 5000);
    }

    // Pause auto-rotation on hover
    const sliderContainer = document.querySelector('.testimonials-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(testimonialInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            startAutoRotation();
        });
    }

    // Start auto-rotation initially
    if (testimonialCards.length > 0) {
        showTestimonial(0);
        startAutoRotation();
    }

    // Sticky navigation on scroll
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

    // Add parallax effect to hero wave
    const heroWave = document.querySelector('.hero-wave');
    if (heroWave) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            heroWave.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        });
    }

    // Pulse animation for CTA buttons
    const pulseButtons = document.querySelectorAll('.pulse');
    pulseButtons.forEach(button => {
        button.style.animation = 'pulse 2s infinite';
    });

    // Animate Quantum Analytics cards on scroll
    const quantumCards = document.querySelectorAll('.algorithm-card, .success-card, .stat-card, .feature-card');
    const quantumObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    quantumCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        quantumObserver.observe(card);
    });

    // Video thumbnail hover effects
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('mouseenter', () => {
            const playButton = thumbnail.querySelector('.play-button');
            if (playButton) {
                playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
            }
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            const playButton = thumbnail.querySelector('.play-button');
            if (playButton) {
                playButton.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
    });
});