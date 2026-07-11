// Discover accordion: one panel open at a time, click to expand
function initDiscoverAccordion() {
  const items = Array.from(document.querySelectorAll('.accordion-item'));
  if (!items.length) return;

  items.forEach((item) => {
    const toggle = item.querySelector('.accordion-item__toggle');
    toggle.addEventListener('click', () => {
      if (item.classList.contains('is-open')) return;
      items.forEach((other) => {
        const isTarget = other === item;
        other.classList.toggle('is-open', isTarget);
        other.querySelector('.accordion-item__toggle').setAttribute('aria-expanded', String(isTarget));
      });
    });
  });
}

// Learn timeline: clicking a bar scrolls to and pulses its programme card
function initLearnTimeline() {
  const bars = document.querySelectorAll('.timeline__bar[data-target]');
  bars.forEach((bar) => {
    bar.addEventListener('click', () => {
      const card = document.getElementById(bar.dataset.target);
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.remove('is-pulsing');
      // eslint-disable-next-line no-unused-expressions
      card.offsetWidth; // restart animation
      card.classList.add('is-pulsing');
      setTimeout(() => card.classList.remove('is-pulsing'), 900);
    });
  });
}

// Stay cards: click a photo to reveal details, dimming the image
function initStayCards() {
  const toggles = document.querySelectorAll('.stay-card__img');
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

// Generic "fake submit" feedback for forms without a backend
function initFakeForms() {
  document.querySelectorAll('[data-fake-submit]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const field = form.querySelector('textarea, input');
      const note = form.querySelector('.form-note');
      if (!field || !field.value.trim()) return;
      if (note) {
        note.textContent = 'Grazie! Il tuo messaggio è stato inviato.';
        note.classList.add('form-success');
      }
      field.value = '';
    });
  });
}

// Fade-in-and-rise reveal for elements marked [data-reveal], triggered on scroll
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  targets.forEach((el) => observer.observe(el));
}

// Belong page: pannable, zoomable, clickable Memory Atlas map
function initAtlasMap() {
  const map = document.getElementById('atlasMap');
  const viewport = document.getElementById('atlasViewport');
  const layer = document.getElementById('atlasLayer');
  if (!map || !viewport || !layer) return;

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;
  const BTN_STEP = 0.3;
  const WHEEL_STEP = 0.18;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let activePopup = null;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function clampPan() {
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    tx = clamp(tx, w * (1 - scale), 0);
    ty = clamp(ty, h * (1 - scale), 0);
  }

  function applyTransform(smooth) {
    layer.style.transition = smooth ? 'transform 0.2s ease' : 'none';
    layer.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  // Zoom while keeping the point under (anchorX, anchorY) — viewport-local px — fixed on screen
  function zoomTo(newScale, anchorX, anchorY, smooth) {
    const clamped = clamp(newScale, MIN_SCALE, MAX_SCALE);
    if (clamped === scale) return;
    const lx = (anchorX - tx) / scale;
    const ly = (anchorY - ty) / scale;
    scale = clamped;
    tx = anchorX - lx * scale;
    ty = anchorY - ly * scale;
    clampPan();
    applyTransform(smooth);
  }

  function closePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  }

  function openPopup(mapX, mapY) {
    closePopup();
    const mapRect = map.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'atlas-popup';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Share your story…';
    input.maxLength = 140;

    const photoBtn = document.createElement('button');
    photoBtn.type = 'button';
    photoBtn.className = 'atlas-popup__photo';
    photoBtn.setAttribute('aria-label', 'Attach a photo');
    photoBtn.textContent = '+';

    const row = document.createElement('div');
    row.className = 'atlas-popup__row';
    row.appendChild(input);
    row.appendChild(photoBtn);
    popup.appendChild(row);

    const popupWidth = 240;
    const left = Math.min(Math.max(mapX, 12), mapRect.width - popupWidth - 12);
    const top = Math.min(Math.max(mapY - 60, 12), mapRect.height - 100);
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    popup.addEventListener('click', (e) => e.stopPropagation());
    photoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      photoBtn.classList.toggle('is-active');
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') closePopup();
    });

    map.appendChild(popup);
    activePopup = popup;
    input.focus();
  }

  // Zoom buttons: anchor at viewport center
  map.querySelectorAll('.atlas-zoom__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      closePopup();
      const dir = btn.dataset.zoom === 'in' ? 1 : -1;
      zoomTo(scale + dir * BTN_STEP, viewport.clientWidth / 2, viewport.clientHeight / 2, true);
    });
  });

  // Mouse wheel: zoom anchored under the cursor
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    closePopup();
    const rect = viewport.getBoundingClientRect();
    const dir = e.deltaY < 0 ? 1 : -1;
    zoomTo(scale + dir * WHEEL_STEP, e.clientX - rect.left, e.clientY - rect.top, false);
  }, { passive: false });

  // Drag to pan
  let dragging = false;
  let dragMoved = false;
  let startX = 0;
  let startY = 0;
  let startTx = 0;
  let startTy = 0;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.atlas-popup')) return;
    dragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startTx = tx;
    startTy = ty;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-grabbing');
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
    if (!dragMoved) return;
    tx = startTx + dx;
    ty = startTy + dy;
    clampPan();
    applyTransform(false);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-grabbing');
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // Click (not a drag) drops a pin and opens the share popup
  viewport.addEventListener('click', (e) => {
    if (dragMoved) {
      dragMoved = false;
      return;
    }
    const layerRect = layer.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();
    const xPercent = ((e.clientX - layerRect.left) / layerRect.width) * 100;
    const yPercent = ((e.clientY - layerRect.top) / layerRect.height) * 100;
    if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return;

    const pin = document.createElement('span');
    pin.className = 'atlas-pin';
    pin.style.left = `${xPercent}%`;
    pin.style.top = `${yPercent}%`;
    layer.appendChild(pin);

    openPopup(e.clientX - mapRect.left, e.clientY - mapRect.top);
  });

  document.addEventListener('click', (e) => {
    if (activePopup && !map.contains(e.target)) closePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDiscoverAccordion();
  initLearnTimeline();
  initStayCards();
  initFakeForms();
  initAtlasMap();
  initScrollReveal();
});
