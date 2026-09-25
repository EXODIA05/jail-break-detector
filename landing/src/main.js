import { ThreatDetectionScene } from './scene.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderStatus = document.getElementById('loader-status');
  const header = document.querySelector('.site-header');

  const interceptCounterEl = document.getElementById('hero-intercept-count');
  const form = document.getElementById('demo-form');
  const formStatus = document.getElementById('form-status');
  const formSubmitBtn = document.getElementById('form-submit-btn');

  // 1. Initialize 3D Threat Detection Scene
  let sceneInstance = null;

  if (canvas) {
    sceneInstance = new ThreatDetectionScene(canvas, {
      onLoadProgress: (percent, statusText) => {
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderStatus) loaderStatus.textContent = statusText;
      },
      onLoaded: () => {
        if (preloader) {
          preloader.classList.add('fade-out');
          setTimeout(() => preloader.remove(), 600);
        }
      },
      onIntercept: (data) => {
        if (interceptCounterEl) {
          interceptCounterEl.textContent = data.totalIntercepted.toLocaleString();
          interceptCounterEl.classList.remove('pulse-green');
          void interceptCounterEl.offsetWidth; // Trigger reflow
          interceptCounterEl.classList.add('pulse-green');
        }
      },
    });
  } else {
    // Fallback if canvas is absent
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 400);
    }
  }

  // 2. Header Scroll Effect
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    },
    { passive: true }
  );

  // 3. Contact / Demo Form Handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const company = document.getElementById('company')?.value.trim();
      const volume = document.getElementById('volume')?.value;
      const message = document.getElementById('message')?.value.trim();

      // Basic validation
      if (!name || !email || !company) {
        showFormStatus('Please complete all required fields.', 'error');
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        showFormStatus('Please provide a valid corporate email address.', 'error');
        return;
      }

      // Button loading state
      const originalText = formSubmitBtn.innerHTML;
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <span>Securing API Keys...</span>
      `;

      // Simulate API verification call
      await new Promise((resolve) => setTimeout(resolve, 950));

      formSubmitBtn.disabled = false;
      formSubmitBtn.innerHTML = originalText;

      showFormStatus(
        `✓ Request Received for ${company}. An Enterprise Security Engineer will reach out to ${email} within 2 hours with SDK sandbox credentials.`,
        'success'
      );
      form.reset();
    });
  }

  function showFormStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = `form-status ${type}`;
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Inject CSS keyframe for spinner
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .pulse-green { color: #10B981 !important; transition: color 0.3s ease; }
  `;
  document.head.appendChild(style);
});
