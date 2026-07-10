// Discover carousel: highlight the card nearest the center as active
function initDiscoverCarousel() {
  const track = document.querySelector('.discover-track');
  if (!track) return;
  const cards = Array.from(track.querySelectorAll('.discover-card'));
  const dotsWrap = document.querySelector('.discover-dots');

  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('is-active');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = cards.indexOf(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          cards.forEach((c) => c.classList.remove('is-active'));
          dots.forEach((d) => d.classList.remove('is-active'));
          entry.target.classList.add('is-active');
          if (dots[idx]) dots[idx].classList.add('is-active');
        }
      });
    },
    { root: track, threshold: [0.6] }
  );
  cards.forEach((c) => observer.observe(c));
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
  initDiscoverCarousel();
  initFakeForms();
  initMapToggle();
});
