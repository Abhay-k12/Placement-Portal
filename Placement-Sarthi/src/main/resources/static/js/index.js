    // Header scroll effect
    window.addEventListener('scroll', function() {
      const header = document.getElementById('header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTop.classList.add('active');
      } else {
        backToTop.classList.remove('active');
      }
    });
    
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Students Carousel
    const studentSlide = document.getElementById("studentSlide");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const indicators = document.querySelectorAll(".indicator");
    let currentIndex = 0;
    const totalSlides = 6;
    let autoSlideInterval;

    function updateCarousel() {
    studentSlide.style.transform = `translateX(${-100 * currentIndex}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
        indicator.classList.add('active');
        } else {
        indicator.classList.remove('active');
        }
    });
    }

    function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoSlide();
    }

    function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
    }

    function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
    }

    function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
    }

    function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
    }

    // Event listeners
    prevBtn.addEventListener('click', function() {
    prevSlide();
    resetAutoSlide();
    });

    nextBtn.addEventListener('click', function() {
    nextSlide();
    resetAutoSlide();
    });

    indicators.forEach(indicator => {
    indicator.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        goToSlide(index);
    });
    });

    // Start auto sliding
    startAutoSlide();


    // Contact form handling
    document.addEventListener('DOMContentLoaded', function() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactFormSubmit);
        }
    });

    async function handleContactFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const messageData = {
            senderName: formData.get('name') || form.querySelector('input[placeholder*="Name"]').value,
            senderEmail: formData.get('email') || form.querySelector('input[placeholder*="Email"]').value,
            subject: formData.get('subject') || form.querySelector('input[placeholder*="Subject"]').value,
            message: formData.get('message') || form.querySelector('textarea').value
        };

        // Validation
        if (!messageData.senderName || !messageData.senderEmail || !messageData.subject || !messageData.message) {
            showContactMessage('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(messageData.senderEmail)) {
            showContactMessage('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';
            submitBtn.disabled = true;

            const response = await fetch('http://localhost:8081/api/messages/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            const result = await response.json();

            if (result.success) {
                showContactMessage('Message sent successfully! We will get back to you soon.', 'success');
                form.reset();
            } else {
                showContactMessage('Failed to send message: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showContactMessage('Network error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    function showContactMessage(message, type) {
        // Create or show message element
        let messageDiv = document.getElementById('contactMessage');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'contactMessage';
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(messageDiv);
        }

        const colors = {
            success: { bg: '#10b981' },
            error: { bg: '#ef4444' },
            info: { bg: '#3b82f6' }
        };

        const style = colors[type] || colors.info;
        messageDiv.style.background = style.bg;
        messageDiv.innerHTML = `${style.icon} ${message}`;
        messageDiv.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    // Scroll animations
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => {
      observer.observe(el);
    });

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav ul');
    
    mobileMenu.addEventListener('click', function() {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (window.innerWidth <= 768) {
            nav.style.display = 'none';
          }
        }
      });
    });