/* ==========================================================================
   Field Crew AI — App JavaScript
   Mobile nav, scroll header, FAQ, scroll animations
   ========================================================================== */

(function () {
  'use strict';

  // ---- Mobile Navigation ----
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Scroll-Aware Header ----
  const header = document.getElementById('header');
  let lastScrollY = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;

    if (scrollY > 100) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    // Hide/show on scroll direction
    if (scrollY > 300) {
      if (scrollY > lastScrollY + 5) {
        header.classList.add('header--hidden');
      } else if (scrollY < lastScrollY - 5) {
        header.classList.remove('header--hidden');
      }
    } else {
      header.classList.remove('header--hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // ---- Scroll Reveal Animations ----
  function setupReveal() {
    // Add reveal classes to sections
    const revealElements = document.querySelectorAll(
      '.problem__text, .problem__cards, .services .section-label, .services .section-heading, ' +
      '.service-card, .steps, .how-it-works__cta, .about__visual, .about__text, ' +
      '.faq .section-label, .faq .section-heading, .faq__list, .contact__text, .contact__form-wrap'
    );

    revealElements.forEach(function (el) {
      el.classList.add('reveal');
    });

    // Add stagger to cards
    const staggerContainers = document.querySelectorAll('.problem__cards, .services__grid, .hero__proof');
    staggerContainers.forEach(function (el) {
      el.classList.add('reveal-stagger');
    });

    // Intersection Observer
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
      observer.observe(el);
    });
  }

  // Check for reduced motion preference
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setupReveal();
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Contact Form Submission ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      const data = {
        name:    contactForm.querySelector('[name="name"]').value.trim(),
        email:   contactForm.querySelector('[name="email"]').value.trim(),
        phone:   (contactForm.querySelector('[name="phone"]') || {}).value || '',
        trade:   (contactForm.querySelector('[name="trade"]') || {}).value || '',
        message: (contactForm.querySelector('[name="message"]') || {}).value || ''
      };

      // Submit to HubSpot
      try {
        await fetch(
          'https://api.hsforms.com/submissions/v3/integration/submit/343140521/bb7cd4a4-e6a3-4309-badd-03ce0d6d673d',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: [
                { name: 'firstname', value: data.name.split(' ')[0] },
                { name: 'lastname',  value: data.name.split(' ').slice(1).join(' ') },
                { name: 'email',     value: data.email },
                { name: 'phone',     value: data.phone },
                { name: 'industry',  value: data.trade },
                { name: 'message',   value: data.message }
              ]
            })
          }
        );
      } catch (err) {
        console.warn('HubSpot submission error:', err);
      }

      // Fire lead agent (fire-and-forget — never blocks or fails the user)
      fetch('https://leads.fieldcrewai.com/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function () {});

      btn.textContent = 'Message Sent!';
    });
  }

})();
