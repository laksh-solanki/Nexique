// CardFesta Multi-Page Application Script

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initTiltEffect();
  initInquiryForm();
});

// 1. Navbar Scroll Effect
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// 2. Mobile Menu Toggle
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isActive = navLinks.classList.toggle('active');
      menuBtn.classList.toggle('active');
      menuBtn.setAttribute('aria-expanded', isActive);
      menuBtn.innerHTML = isActive ? '&#10005;' : '&#9776;';
    });

    // Close menu when link is clicked (on mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove('active');
          menuBtn.classList.remove('active');
          menuBtn.setAttribute('aria-expanded', false);
          menuBtn.innerHTML = '&#9776;';
        }
      });
    });

    // Reset layout on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', false);
        menuBtn.innerHTML = '&#9776;';
      }
    });
  }
}

// 3. Scroll Reveal Animations (Intersection Observer)
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.section-header, .gallery-card-item, .about-text-content, .about-graphics, .contact-container'
  );

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

// 4. Live Customizer (Removed)

// 5. 3D Tilt Effect on hover
function initTiltEffect() {
  const elementsToTilt = document.querySelectorAll('[data-tilt], #live-card');

  elementsToTilt.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      const rotateY = ((x - (width / 2)) / (width / 2)) * 12;
      const rotateX = -((y - (height / 2)) / (height / 2)) * 12;
      
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// 6. Contact Inquiry Form Submission & Auto-Fill Parameters
function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  const alertBox = document.getElementById('form-alert');
  const styleSelect = document.getElementById('usr-style');
  const msgTextarea = document.getElementById('usr-msg');

  if (form) {
    // Parse URL query parameters to auto-fill dropdown / message field
    const urlParams = new URLSearchParams(window.location.search);
    const styleParam = urlParams.get('style');
    const packageParam = urlParams.get('package');

    if (styleSelect && styleParam) {
      const validStyles = ['greeting', 'business', 'wedding', 'playing', 'collection', 'other'];
      if (validStyles.includes(styleParam)) {
        styleSelect.value = styleParam;
      }
    }

    if (msgTextarea && packageParam) {
      let pkgText = '';
      if (packageParam === 'silver') pkgText = 'Silver Foil Press ($149)';
      if (packageParam === 'gold') pkgText = 'Gold NFC Premium ($299)';
      if (packageParam === 'bespoke') pkgText = 'Bespoke Metal Legacy ($599)';
      
      if (pkgText) {
        msgTextarea.value = `I am interested in inquiring about the ${pkgText} package. Please contact me with design details.`;
      }
    }

    if (alertBox) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        alertBox.style.display = 'block';
        form.reset();

        alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          alertBox.style.display = 'none';
        }, 8000);
      });
    }
  }
}
