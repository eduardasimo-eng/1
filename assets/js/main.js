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

// Belong page: zoomable, clickable Memory Atlas map
function initAtlasMap() {
  const map = document.getElementById('atlasMap');
  const viewport = document.getElementById('atlasViewport');
  const layer = document.getElementById('atlasLayer');
  if (!map || !viewport || !layer) return;

  const MIN_SCALE = 1;
  const MAX_SCALE = 2.5;
  const STEP = 0.3;
  let scale = 1;
  let activePopup = null;

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

  map.querySelectorAll('.atlas-zoom__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      closePopup();
      scale = btn.dataset.zoom === 'in'
        ? Math.min(MAX_SCALE, +(scale + STEP).toFixed(2))
        : Math.max(MIN_SCALE, +(scale - STEP).toFixed(2));
      layer.style.transform = `scale(${scale})`;
    });
  });

  viewport.addEventListener('click', (e) => {
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
});
