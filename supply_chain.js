document.addEventListener('DOMContentLoaded', function() {
    // Animate guarantee card on scroll
    const guaranteeCard = document.querySelector('.guarantee-card');
    if (guaranteeCard) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    guaranteeCard.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(guaranteeCard);
    }

    // Animate demand cards sequentially
    const demandCards = document.querySelectorAll('.demand-card');
    if (demandCards.length > 0) {
        demandCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease ' + (index * 0.1) + 's';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(card);
        });
    }

    // Animate reason cards with staggered delay
    const reasonCards = document.querySelectorAll('.reason-card');
    if (reasonCards.length > 0) {
        reasonCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            card.style.transition = 'all 0.5s ease ' + (index * 0.1) + 's';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(card);
        });
    }

    // Parallax effect for hero image
    const heroImage = document.querySelector('.supply-hero .hero-image');
    if (heroImage) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            heroImage.style.transform = 'translateY(' + scrollPosition * 0.2 + 'px) perspective(1000px) rotateY(-15deg)';
        });
    }

    // Animate step cards with connecting line
    const stepCards = document.querySelectorAll('.step-card');
    if (stepCards.length > 0) {
        const engagementSteps = document.querySelector('.engagement-steps');
        engagementSteps.style.position = 'relative';
        
        // Create connecting line
        const connectingLine = document.createElement('div');
        connectingLine.style.position = 'absolute';
        connectingLine.style.top = '0';
        connectingLine.style.left = '25px';
        connectingLine.style.width = '2px';
        connectingLine.style.height = '100%';
        connectingLine.style.background = 'linear-gradient(to bottom, var(--primary-color), var(--accent-color))';
        connectingLine.style.zIndex = '0';
        engagementSteps.appendChild(connectingLine);
        
        // Position step cards
        stepCards.forEach((card, index) => {
            card.style.position = 'relative';
            card.style.zIndex = '1';
            card.style.opacity = '0';
            card.style.transform = 'translateX(-50px)';
            card.style.transition = 'all 0.5s ease ' + (index * 0.2) + 's';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        card.style.opacity = '1';
                        card.style.transform = 'translateX(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(card);
        });
    }

    // Logo hover animation
    const logoItems = document.querySelectorAll('.logo-item');
    if (logoItems.length > 0) {
        logoItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) rotate(' + (Math.random() * 10 - 5) + 'deg)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) rotate(0)';
            });
        });
    }

    // Floating animation for accuracy badge
    const accuracyBadge = document.querySelector('.accuracy-badge');
    if (accuracyBadge) {
        function floatAnimation() {
            accuracyBadge.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                accuracyBadge.style.transform = 'translateY(5px)';
                setTimeout(() => {
                    accuracyBadge.style.transform = 'translateY(0)';
                    setTimeout(floatAnimation, 2000);
                }, 1000);
            }, 1000);
        }
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                floatAnimation();
                observer.unobserve(entries[0].target);
            }
        }, { threshold: 0.1 });

        observer.observe(accuracyBadge);
    }

    // Typewriter effect for guarantee text
    const guaranteeText = document.querySelector('.guarantee-content p');
    if (guaranteeText) {
        const originalText = guaranteeText.textContent;
        guaranteeText.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                guaranteeText.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 20);
            }
        }
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                typeWriter();
                observer.unobserve(entries[0].target);
            }
        }, { threshold: 0.1 });

        observer.observe(guaranteeText);
    }

    // Pulse animation for CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    if (ctaButtons.length > 0) {
        function pulseAnimation() {
            ctaButtons.forEach(btn => {
                btn.style.transform = 'scale(1)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        btn.style.transform = 'scale(1)';
                        setTimeout(pulseAnimation, 3000);
                    }, 500);
                }, 500);
            });
        }
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                pulseAnimation();
                observer.unobserve(entries[0].target);
            }
        }, { threshold: 0.1 });

        observer.observe(document.querySelector('.cta-buttons'));
    }
});

// Add custom animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    
    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .animate-pulse {
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-rotate {
        animation: rotate 10s linear infinite;
    }
`;
document.head.appendChild(style);