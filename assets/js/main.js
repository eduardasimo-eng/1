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

// Belong page: reveal the illustrative map panel
function initMapToggle() {
  const toggle = document.querySelector('.map-toggle');
  const panel = document.querySelector('.map-panel');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    if (isOpen) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDiscoverAccordion();
  initFakeForms();
  initMapToggle();
});
