document.addEventListener('DOMContentLoaded', function() {
    // Animate rating cards with staggered delay
    const ratingCards = document.querySelectorAll('.rating-card');
    if (ratingCards.length > 0) {
        ratingCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.5s ease ${index * 0.1}s`;
            
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

    // Floating animation for rating icons
    const ratingIcons = document.querySelectorAll('.rating-icon');
    if (ratingIcons.length > 0) {
        ratingIcons.forEach(icon => {
            icon.style.transform = 'translateY(0)';
            
            function floatAnimation() {
                icon.style.transform = 'translateY(-5px)';
                setTimeout(() => {
                    icon.style.transform = 'translateY(5px)';
                    setTimeout(() => {
                        icon.style.transform = 'translateY(0)';
                        setTimeout(floatAnimation, 3000);
                    }, 1000);
                }, 1000);
            }
            
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    floatAnimation();
                    observer.unobserve(entries[0].target);
                }
            }, { threshold: 0.1 });

            observer.observe(icon);
        });
    }

    // Timeline animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            item.style.transition = `all 0.5s ease ${index * 0.2}s`;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(item);
        });
    }

    // Rotate benefit icons on hover
    const benefitIcons = document.querySelectorAll('.benefit-icon');
    if (benefitIcons.length > 0) {
        benefitIcons.forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'rotate(15deg) scale(1.1)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'rotate(0) scale(1)';
            });
        });
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

    // Animate methodology points with typewriter effect
    const methodologyPoints = document.querySelectorAll('.methodology-point');
    if (methodologyPoints.length > 0) {
        methodologyPoints.forEach((point, index) => {
            point.style.opacity = '0';
            point.style.transform = 'translateY(20px)';
            point.style.transition = `all 0.5s ease ${index * 0.2}s`;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        
                        // Add typewriter effect to content
                        const content = entry.target.querySelector('.point-content p');
                        if (content) {
                            const originalText = content.textContent;
                            content.textContent = '';
                            
                            let i = 0;
                            function typeWriter() {
                                if (i < originalText.length) {
                                    content.textContent += originalText.charAt(i);
                                    i++;
                                    setTimeout(typeWriter, 20);
                                }
                            }
                            typeWriter();
                        }
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(point);
        });
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