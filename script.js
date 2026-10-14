// Show the JL Mobile Fix logo intro before revealing the homepage.
(function startSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  const finishSplash = () => {
    splash.classList.add('is-done');
    window.setTimeout(() => splash.remove(), 750);
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setTimeout(finishSplash, 500);
  } else {
    window.setTimeout(finishSplash, 2500);
  }
})();

function updatePhilippineDateTime() {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  }).format(now);
  const el = document.getElementById('datetime');
  if (el) el.textContent = formatted;
}
updatePhilippineDateTime();
setInterval(updatePhilippineDateTime, 1000);

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile navigation opens/closes and collapses after choosing a section.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
    mainNav.classList.toggle('is-open', !expanded);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    mainNav.classList.remove('is-open');
  }));
}

// Service cards open a useful inquiry dialog and work with keyboard controls.
const serviceDialog = document.getElementById('service-dialog');
const selectedService = document.getElementById('selected-service');
const messageService = document.getElementById('message-service');
const serviceDescription = document.getElementById('dialog-description');
const serviceCards = document.querySelectorAll('.service-card[data-service]');
const repairInquiry = document.getElementById('repair-inquiry');
const repairIssueSelect = document.querySelector('#repair-request-form select[name="issue"]');

const serviceMessages = {
  'Screen / LCD Repair': 'Ask about screen damage, display lines, cracked glass, or an unresponsive touchscreen.',
  'Battery & Charging': 'Ask about battery drain, charging issues, or a device that will not power on.',
  'Device Unlocking': 'Ask about available unlocking options and whether they are compatible with your device.',
  'Gadget Troubleshooting': 'Describe what happened to your device so the team can help you decide on the next step.'
};
function showRepairForm(service) {
  if (!repairInquiry) return;
  repairInquiry.hidden = false;
  if (repairIssueSelect && service) {
    const matching = Array.from(repairIssueSelect.options).find(option =>
      option.value === service || option.textContent.trim() === service
    );
    if (matching) repairIssueSelect.value = matching.value;
  }
  repairInquiry.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const firstField = repairInquiry.querySelector('input[name="customerName"]');
  if (firstField) window.setTimeout(() => firstField.focus({ preventScroll: true }), 350);
}

function openServiceDialog(card) {
  const service = card.dataset.service || 'Gadget Troubleshooting';
  showRepairForm(service);
  selectedService.textContent = service;
  serviceDescription.textContent = serviceMessages[service] || 'Tell us a little about your device and we’ll help you explore the available options.';
  if (messageService) {
    const message = `Hi JL Mobile Fix! I'd like to ask about ${service}. My phone model is ______ and the issue is ______.`;
    messageService.href = 'https://m.me/jlmobilefix?text=' + encodeURIComponent(message);
  }

}
serviceCards.forEach(card => {
  card.addEventListener('click', () => openServiceDialog(card));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openServiceDialog(card);
    }
  });
});
const dialogClose = document.querySelector('.dialog-close');
if (dialogClose && serviceDialog) dialogClose.addEventListener('click', () => serviceDialog.close());
if (serviceDialog) {
  serviceDialog.addEventListener('click', event => {
    if (event.target === serviceDialog) serviceDialog.close();
  });
}

// Reveal sections as they enter view; content remains visible if animations are unsupported.
const revealTargets = document.querySelectorAll('.section-head, .service-card, .why-card, .promise-inner, .visit-copy, .map-frame, .social-inner, .payment-copy, .payment-image-wrap');
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 4) * 70}ms`;
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => observer.observe(el));
}


// Repair request: Step 1 copies the filled form. Step 2 opens Messenger for the customer to paste and send.
const repairForm = document.getElementById('repair-request-form');
const inquiryStatus = document.getElementById('inquiry-status');
const copyRepairButton = document.getElementById('copy-repair-request');
const openMessengerButton = document.getElementById('open-repair-messenger');
let repairMessage = '';

function buildRepairMessage() {
  const data = new FormData(repairForm);
  return [
    'JL MOBILE FIX - REPAIR REQUEST',
    '',
    `Name: ${String(data.get('customerName') || '').trim()}`,
    `Contact number: ${String(data.get('contactNumber') || '').trim()}`,
    `Device brand: ${data.get('deviceBrand') || ''}`,
    `Phone model: ${String(data.get('phoneModel') || '').trim()}`,
    `Issue/service: ${data.get('issue') || ''}`,
    `Problem details: ${String(data.get('problem') || '').trim()}`
  ].join('\n');
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();
  if (!copied) throw new Error('Copy unavailable');
  return true;
}

if (repairForm && inquiryStatus && copyRepairButton && openMessengerButton) {
  copyRepairButton.addEventListener('click', async () => {
    if (!repairForm.reportValidity()) return;
    repairMessage = buildRepairMessage();
    inquiryStatus.hidden = false;
    inquiryStatus.innerHTML = '';
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    inquiryStatus.append(title, detail);
    try {
      await copyText(repairMessage);
      title.textContent = 'Step 1 complete - request copied!';
      detail.textContent = 'Now click “2. Open Messenger & Paste”, tap the message box, paste your request, and press Send. Please wait for our team to reply.';
      copyRepairButton.classList.add('request-copied');
      copyRepairButton.querySelector('span').textContent = 'Copied! Copy Again';
      openMessengerButton.setAttribute('aria-disabled', 'false');
      openMessengerButton.classList.remove('messenger-disabled');
    } catch (_) {
      title.textContent = 'Please copy your request manually';
      detail.textContent = 'Your browser blocked copying. Select and copy the request below, then open Messenger and paste it into the chat.';
      const preview = document.createElement('textarea');
      preview.className = 'message-preview';
      preview.value = repairMessage;
      preview.rows = 7;
      preview.readOnly = true;
      preview.setAttribute('aria-label', 'Repair request to copy');
      inquiryStatus.appendChild(preview);
      preview.focus();
      preview.select();
      openMessengerButton.setAttribute('aria-disabled', 'false');
      openMessengerButton.classList.remove('messenger-disabled');
    }
    inquiryStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  openMessengerButton.addEventListener('click', event => {
    if (!repairMessage) {
      event.preventDefault();
      inquiryStatus.hidden = false;
      inquiryStatus.textContent = 'Please complete the form and click “1. Copy Request” first. Then open Messenger and paste your request.';
      inquiryStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  repairForm.addEventListener('input', () => {
    repairMessage = '';
    copyRepairButton.classList.remove('request-copied');
    copyRepairButton.querySelector('span').textContent = '1. Copy Request';
    openMessengerButton.setAttribute('aria-disabled', 'true');
    openMessengerButton.classList.add('messenger-disabled');
  });
  repairForm.addEventListener('change', () => {
    repairMessage = '';
    openMessengerButton.setAttribute('aria-disabled', 'true');
    openMessengerButton.classList.add('messenger-disabled');
  });
}


// Let customers choose and preview a payment receipt before sending it via Messenger.
(function paymentProofUpload() {
  const input = document.getElementById('payment-proof');
  const previewWrap = document.getElementById('payment-proof-preview-wrap');
  const preview = document.getElementById('payment-proof-preview');
  const fileName = document.getElementById('payment-proof-name');
  if (!input || !previewWrap || !preview || !fileName) return;
  let currentPreviewUrl = '';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = '';
    if (!file) { previewWrap.hidden = true; preview.removeAttribute('src'); fileName.textContent = ''; return; }
    if (!file.type.startsWith('image/')) { input.value = ''; previewWrap.hidden = true; alert('Please choose an image screenshot of your payment receipt.'); return; }
    currentPreviewUrl = URL.createObjectURL(file);
    preview.src = currentPreviewUrl;
    fileName.textContent = file.name;
    previewWrap.hidden = false;
  });
})();




// Download the QR as a blob so the browser saves it instead of opening the image.
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('download-gcash-qr');
  if (!button) return;
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const originalLabel = button.textContent;
    button.setAttribute('aria-busy', 'true');
    try {
      const qrUrl = new URL('assets/gcash-payment.jpg', document.baseURI).href;
      const response = await fetch(qrUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Could not load QR image');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'JL-Mobile-Fix-GCash-QR.jpg';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch (error) {
      // Native download fallback for browsers that block blob downloads.
      const fallback = document.createElement('a');
      fallback.href = new URL('assets/gcash-payment.jpg', document.baseURI).href;
      fallback.setAttribute('download', 'JL-Mobile-Fix-GCash-QR.jpg');
      document.body.appendChild(fallback);
      fallback.click();
      fallback.remove();
    } finally {
      button.removeAttribute('aria-busy');
    }
  });
});


// Open the GCash QR in a zoomable lightbox when the QR image is clicked.
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('gcash-qr-zoom');
  const lightbox = document.getElementById('gcash-qr-lightbox');
  const closeButton = document.getElementById('gcash-qr-close');
  if (!trigger || !lightbox || !closeButton) return;
  const close = () => { lightbox.hidden = true; document.body.style.overflow = ''; trigger.focus(); };
  trigger.addEventListener('click', () => { lightbox.hidden = false; document.body.style.overflow = 'hidden'; closeButton.focus(); });
  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !lightbox.hidden) close(); });
});
