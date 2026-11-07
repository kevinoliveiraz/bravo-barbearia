'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The page remains readable without JavaScript; motion is progressive enhancement.
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('js');
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        reveals.unobserve(entry.target);
      }
    });
  }, { threshold: 0.09 });
  $$('.reveal').forEach(element => reveals.observe(element));
}

let scrollScheduled = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $('.scroll-progress').style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  scrollScheduled = false;
};
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(updateProgress);
  }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// Mobile navigation.
const menuToggle = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.hidden = true;
};
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  mobileMenu.hidden = expanded;
});
$$('a, button', mobileMenu).forEach(element => element.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!mobileMenu.hidden && !event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 1025px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// A deliberately local appointment demonstration. Nothing is sent or persisted.
const services = Object.freeze({
  corte: { title: 'Corte assinatura', duration: 45, price: 65 },
  barba: { title: 'Barba & ritual', duration: 30, price: 45 },
  combo: { title: 'Corte + barba', duration: 75, price: 95 },
  completo: { title: 'Ritual completo', duration: 90, price: 125 }
});
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
const bookingDialog = $('#booking-dialog');
const state = { service: 'corte', professional: 'Primeiro disponível', dateIndex: 0, time: null, step: 1 };
const slotTimes = ['09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30', '18:00'];

const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
const part = key => Number(parts.find(item => item.type === key).value);
const start = new Date(Date.UTC(part('year'), part('month') - 1, part('day'), 12));
const availableDates = [];
for (let offset = 1; availableDates.length < 6; offset++) {
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + offset);
  if (date.getUTCDay() !== 0) availableDates.push(date);
}
const dateLabel = (date, options) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...options }).format(date);

function availableSlot(time, index) {
  const [hour, minute] = time.split(':').map(Number);
  const end = hour * 60 + minute + services[state.service].duration;
  const busyIndex = (state.dateIndex + (state.professional === 'Primeiro disponível' ? 0 : state.professional.length)) % 5;
  return end <= 19 * 60 && index !== busyIndex && index !== (busyIndex + 3) % 7;
}

function renderTimes() {
  const root = $('.time-options');
  root.replaceChildren();
  slotTimes.forEach((time, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-option';
    button.textContent = time;
    button.disabled = !availableSlot(time, index);
    if (button.disabled && state.time === time) state.time = null;
    button.setAttribute('aria-label', `${time}${button.disabled ? ', indisponível' : ''}`);
    button.setAttribute('aria-pressed', String(time === state.time));
    button.classList.toggle('selected', time === state.time);
    button.addEventListener('click', () => {
      state.time = time;
      $('#time-error').textContent = '';
      $$('.time-option').forEach(option => {
        const selected = option.textContent === time;
        option.classList.toggle('selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
    });
    root.append(button);
  });
  $('#duration-note').textContent = `Duração: ${services[state.service].duration} min`;
}

function renderDates() {
  const root = $('.date-options');
  root.replaceChildren();
  availableDates.forEach((date, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-option';
    button.classList.toggle('selected', index === state.dateIndex);
    button.setAttribute('aria-pressed', String(index === state.dateIndex));
    button.setAttribute('aria-label', dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' }));
    const weekday = document.createElement('small');
    weekday.textContent = dateLabel(date, { weekday: 'short' }).replace('.', '').toUpperCase();
    const day = document.createElement('strong');
    day.textContent = dateLabel(date, { day: '2-digit' });
    const month = document.createElement('small');
    month.textContent = dateLabel(date, { month: 'short' }).replace('.', '').toUpperCase();
    button.append(weekday, day, month);
    button.addEventListener('click', () => {
      state.dateIndex = index;
      state.time = null;
      $('#time-error').textContent = '';
      renderDates();
      renderTimes();
      $$('.date-option')[index].focus({ preventScroll: true });
    });
    root.append(button);
  });
}

function updateServiceChoice(key) {
  if (!services[key]) return;
  state.service = key;
  state.time = null;
  $$('.booking-service').forEach(button => {
    const selected = button.dataset.choice === key;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderTimes();
}

function reviewRows(root) {
  root.replaceChildren();
  const service = services[state.service];
  const rows = [
    ['SEU RITUAL', service.title],
    ['PROFISSIONAL', state.professional],
    ['DIA & HORÁRIO', `${dateLabel(availableDates[state.dateIndex], { day: '2-digit', month: 'long' })} · ${state.time}`],
    ['DURAÇÃO', `${service.duration} minutos`],
    ['VALOR ILUSTRATIVO', money(service.price)]
  ];
  rows.forEach(([label, value], index) => {
    const row = document.createElement('div');
    row.className = `review-row${index === rows.length - 1 ? ' review-total' : ''}`;
    const name = document.createElement('span');
    name.textContent = label;
    const content = document.createElement('strong');
    content.textContent = value;
    row.append(name, content);
    root.append(row);
  });
}

function showStep(step) {
  state.step = step;
  $$('.booking-panel').forEach(panel => { panel.hidden = Number(panel.dataset.step) !== step; });
  $$('.booking-steps span').forEach(label => {
    const index = Number(label.dataset.stepLabel);
    label.classList.toggle('current', index === step);
    label.classList.toggle('done', index < step);
    if (index === step) label.setAttribute('aria-current', 'step');
    else label.removeAttribute('aria-current');
  });
  $('.booking-steps').hidden = step === 4;
  if (step === 3) reviewRows($('#booking-review'));
  const heading = $(`[data-step="${step}"] h3`);
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  bookingDialog.scrollTop = 0;
}

$$('.book-trigger').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  state.professional = 'Primeiro disponível';
  state.dateIndex = 0;
  state.time = null;
  $('#professional').value = state.professional;
  $('#guest-name').value = '';
  $('#time-error').textContent = '';
  updateServiceChoice(button.dataset.service || 'corte');
  renderDates();
  bookingDialog.showModal();
  document.body.classList.add('modal-open');
  showStep(1);
}));
$$('.booking-service').forEach(button => button.addEventListener('click', () => updateServiceChoice(button.dataset.choice)));
$('#professional').addEventListener('change', event => {
  state.professional = event.target.value;
  state.time = null;
  renderTimes();
});
$$('[data-next]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.next))));
$$('[data-back]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.back))));
$('#review-booking').addEventListener('click', () => {
  if (!state.time) {
    $('#time-error').textContent = 'Escolha um horário disponível para continuar.';
    $('.time-option:not(:disabled)').focus({ preventScroll: true });
    return;
  }
  showStep(3);
});
$('#confirm-booking').addEventListener('click', () => {
  if (!state.time) { showStep(2); return; }
  const name = $('#guest-name').value.trim();
  $('#success-greeting').textContent = name ? `${name}, este seria o seu próximo ritual na BRAVO.` : 'Este seria o seu próximo ritual na BRAVO.';
  reviewRows($('#success-summary'));
  showStep(4);
});

// Gallery filters and keyboard-accessible lightbox.
const galleryItems = $$('.gallery-item');
let visibleGallery = [...galleryItems];
let galleryIndex = 0;
const lightbox = $('#lightbox');

$$('.filter').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  $$('.filter').forEach(option => {
    const active = option === button;
    option.classList.toggle('active', active);
    option.setAttribute('aria-pressed', String(active));
  });
  galleryItems.forEach(item => { item.hidden = filter !== 'todos' && item.dataset.category !== filter; });
  visibleGallery = galleryItems.filter(item => !item.hidden);
  $('#gallery-status').textContent = `${visibleGallery.length} referências visuais`;
  window.requestAnimationFrame(updateProgress);
}));
function showGalleryImage(index) {
  galleryIndex = (index + visibleGallery.length) % visibleGallery.length;
  const item = visibleGallery[galleryIndex];
  $('#lightbox-image').src = item.dataset.image;
  $('#lightbox-image').alt = $('img', item).alt;
  $('#lightbox-title').textContent = item.dataset.title;
  $('#lightbox-counter').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(visibleGallery.length).padStart(2, '0')}`;
}
galleryItems.forEach(item => item.addEventListener('click', () => {
  visibleGallery = galleryItems.filter(image => !image.hidden);
  showGalleryImage(visibleGallery.indexOf(item));
  lightbox.showModal();
  document.body.classList.add('modal-open');
}));
$('.lightbox-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
$('.lightbox-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showGalleryImage(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

// The same gallery can be explored by horizontal swipes on touch screens.
const lightboxImage = $('#lightbox-image');
let galleryPointer = null;
lightboxImage.draggable = false;
lightboxImage.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  galleryPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  lightboxImage.setPointerCapture?.(event.pointerId);
});
lightboxImage.addEventListener('pointerup', event => {
  if (!galleryPointer || galleryPointer.id !== event.pointerId) return;
  const dx = event.clientX - galleryPointer.x;
  const dy = event.clientY - galleryPointer.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) showGalleryImage(galleryIndex + (dx < 0 ? 1 : -1));
  galleryPointer = null;
  if (lightboxImage.hasPointerCapture?.(event.pointerId)) lightboxImage.releasePointerCapture(event.pointerId);
});
lightboxImage.addEventListener('pointercancel', () => { galleryPointer = null; });

// Native focus containment/restoration, with a short animated closing phase.
const closingDialogs = new WeakSet();
function closeDialog(dialog) {
  if (!dialog.open || closingDialogs.has(dialog)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
  closingDialogs.add(dialog);
  dialog.classList.add('dialog-closing');
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove('dialog-closing');
    closingDialogs.delete(dialog);
  }, 250);
}
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));
$$('dialog').forEach(dialog => {
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('close', () => {
    if (!$('dialog[open]')) document.body.classList.remove('modal-open');
    if (dialog === bookingDialog) $('#guest-name').value = '';
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog(dialog);
  });
});
