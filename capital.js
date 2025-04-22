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
        
        // Add animation to theme toggle
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
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

    // Handle navigation tab clicks
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.getAttribute('data-tab');
            const sliderTab = document.querySelector(`.slider-tab[data-tab="${targetTab}"]`);
            
            if (sliderTab) {
                // Click the corresponding slider tab
                sliderTab.click();
                
                // Close mobile menu if open
                if (mobileMenuBtn && navLinks.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Scroll to the slider section
                const sliderSection = document.querySelector('.approach-slider');
                if (sliderSection) {
                    window.scrollTo({
                        top: sliderSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
            backToTopBtn.style.animation = 'fadeIn 0.3s ease-in-out';
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
    }, { threshold: 0.5 });
    
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

    // About/Why/How slider functionality
    const sliderTabs = document.querySelectorAll('.slider-tab');
    const slides = document.querySelectorAll('.slide');
    
    sliderTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            sliderTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get the target slide ID
            const targetSlide = tab.getAttribute('data-tab') + '-slide';
            
            // Hide all slides
            slides.forEach(slide => slide.classList.remove('active'));
            // Show target slide
            document.getElementById(targetSlide).classList.add('active');
        });
    });

    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.approach-item, .stat-card, .feature-card, .algorithm-card, .success-card, .recognition-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Add bounce effect to cards
                    if (entry.target.classList.contains('stat-card') || 
                        entry.target.classList.contains('feature-card') ||
                        entry.target.classList.contains('recognition-card')) {
                        entry.target.style.animation = 'bounceIn 0.6s ease-out';
                    }
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(element);
        });
    };

    // Initialize animations
    animateOnScroll();

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

    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });
    });

    // Add animation to recognition cards
    const recognitionCards = document.querySelectorAll('.recognition-card');
    recognitionCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.recognition-icon');
            icon.style.transform = 'rotate(15deg) scale(1.1)';
            icon.style.color = '#3a56d4';
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.recognition-icon');
            icon.style.transform = 'rotate(0) scale(1)';
            icon.style.color = '#4361ee';
        });
    });
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0.95); opacity: 0; }
        50% { transform: scale(1.05); }
        80% { transform: scale(0.98); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
    }
`;
document.head.appendChild(style);