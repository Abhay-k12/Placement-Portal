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

    // Form submission
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for your message! We will get back to you soon.');
      this.reset();
    });

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