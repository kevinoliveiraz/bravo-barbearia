'use strict';

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero-visual');
  const concept = document.querySelector('.concept');
  const transformSection = document.querySelector('.transformation');
  const appointment = document.querySelector('.appointment-banner');
  const footer = document.querySelector('.site-footer');
  const cursor = document.querySelector('.gallery-cursor');

  let introTimer;
  let introFrame;
  const introWord = document.querySelector('.intro-brand strong');
  const introLetters = document.createElement('span');
  introLetters.className = 'intro-letters';
  for (const [index, letter] of [...'BRAVO'].entries()) {
    const span = document.createElement('i');
    span.textContent = letter;
    span.style.setProperty('--letter-index', index);
    introLetters.append(span);
  }
  introWord.firstChild.replaceWith(introLetters);
  function playIntro() {
    if (reduced.matches) return;
    clearTimeout(introTimer);
    cancelAnimationFrame(introFrame);
    document.documentElement.classList.remove('run-intro');
    introFrame = requestAnimationFrame(() => {
      introFrame = requestAnimationFrame(() => {
        document.documentElement.classList.add('run-intro');
        introTimer = setTimeout(() => document.documentElement.classList.remove('run-intro'), 2100);
      });
    });
  }
  playIntro();

  // Small, bounded motion driven by scrolling; no permanent rendering loop.
  let scheduled = false;
  function motionFrame() {
    scheduled = false;
    if (reduced.matches) return;
    const view = window.innerHeight;
    const heroTop = hero.getBoundingClientRect().top;
    if (heroTop < view && heroTop > -800) {
      hero.style.setProperty('--photo-y', `${Math.max(-28, Math.min(28, -heroTop * .055))}px`);
      hero.style.setProperty('--type-y', `${Math.max(-18, Math.min(18, heroTop * .03))}px`);
    }
    const conceptY = concept.getBoundingClientRect().top;
    if (conceptY < view && conceptY > -1000) concept.style.setProperty('--backtype-y', `${Math.max(-30, Math.min(30, conceptY * .05))}px`);
    transformSection.style.setProperty('--star-rotation', `${(view - transformSection.getBoundingClientRect().top) * .055}deg`);
    appointment.style.setProperty('--cta-rotation', `${(view - appointment.getBoundingClientRect().top) * .045}deg`);
    footer.style.setProperty('--footer-rotation', `${(view - footer.getBoundingClientRect().top) * .035}deg`);
  }
  function scheduleMotion() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(motionFrame); }
  }
  window.addEventListener('scroll', scheduleMotion, { passive: true });
  window.addEventListener('resize', scheduleMotion);
  scheduleMotion();

  hero.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches) return;
    const box = hero.getBoundingClientRect();
    hero.style.setProperty('--pointer-x', `${((event.clientX - box.left) / box.width - .5) * 30}px`);
    hero.style.setProperty('--pointer-y', `${((event.clientY - box.top) / box.height - .5) * 22}px`);
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--pointer-x', '0px');
    hero.style.setProperty('--pointer-y', '0px');
  });

  // A visual cut accompanies the existing native anchor navigation.
  const cut = document.querySelector('.cut-transition');
  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(link => link.addEventListener('click', () => {
    if (reduced.matches) return;
    cut.classList.remove('is-cutting');
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => cut.classList.add('is-cutting')));
  }));
  cut.addEventListener('animationend', () => cut.classList.remove('is-cutting'));

  // Magnetic CTAs stay within eight pixels of their natural hit area.
  document.querySelectorAll('.hero-action .button, .appointment-side .button').forEach(button => {
    let box;
    button.addEventListener('pointerenter', () => { box = button.getBoundingClientRect(); });
    button.addEventListener('pointermove', event => {
      if (!box || reduced.matches || !finePointer.matches) return;
      const x = (event.clientX - box.left - box.width / 2) * .065;
      const y = (event.clientY - box.top - box.height / 2) * .12;
      button.style.transform = `translate(${Math.max(-8, Math.min(8, x))}px,${Math.max(-5, Math.min(5, y))}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    button.addEventListener('blur', () => { button.style.transform = ''; });
  });

  const preview = document.querySelector('.service-preview');
  const rituals = document.querySelector('.rituals');
  const previewPhotos = preview.querySelectorAll('[data-service-photo]');
  const previewViewport = window.matchMedia('(min-width: 801px) and (min-height: 501px), (min-width: 1025px)');
  const canShowPreview = () => finePointer.matches && previewViewport.matches && !reduced.matches;
  let previewRow = null;
  let previewHideTimer;

  function positionPreview(row, clientX) {
    const section = rituals.getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    const offset = clientX === undefined ? section.width * .63 : clientX - section.left;
    const x = Math.max(section.width * .53, Math.min(section.width * .69, offset));
    preview.style.left = `${x}px`;
    preview.style.top = `${bounds.top - section.top + bounds.height / 2}px`;
  }

  function showPreview(row, clientX) {
    clearTimeout(previewHideTimer);
    const hidden = !preview.classList.contains('active') && getComputedStyle(preview).opacity === '0';
    if (hidden) preview.classList.add('is-placing');
    positionPreview(row, clientX);
    if (previewRow !== row) {
      previewPhotos.forEach(photo => {
        photo.classList.toggle('is-current', photo.dataset.servicePhoto === row.dataset.service);
      });
    }
    if (hidden) {
      // Position the hidden card and select its photo before animating it in.
      void preview.offsetWidth;
      preview.classList.remove('is-placing');
    }
    previewRow = row;
    preview.classList.add('active');
  }

  function hidePreview() {
    clearTimeout(previewHideTimer);
    preview.classList.remove('active');
  }

  function schedulePreviewHide(row) {
    if (previewRow !== row) return;
    clearTimeout(previewHideTimer);
    previewHideTimer = setTimeout(hidePreview, 65);
  }

  document.querySelectorAll('.service-row').forEach(row => {
    row.addEventListener('pointerenter', event => {
      if (canShowPreview() && event.pointerType !== 'touch') showPreview(row, event.clientX);
    });
    row.addEventListener('pointermove', event => {
      if (canShowPreview() && event.pointerType !== 'touch' && previewRow === row) {
        positionPreview(row, event.clientX);
      }
    });
    row.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') schedulePreviewHide(row);
    });
    row.addEventListener('click', hidePreview);
    row.addEventListener('focus', () => {
      if (canShowPreview() && row.matches(':focus-visible')) showPreview(row);
    });
    row.addEventListener('blur', () => {
      if (!row.matches(':hover')) schedulePreviewHide(row);
    });
  });
  [finePointer, previewViewport].forEach(query => {
    query.addEventListener('change', () => { if (!canShowPreview()) hidePreview(); });
  });

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('pointerenter', () => {
      if (finePointer.matches && !reduced.matches) cursor.classList.add('active');
    });
    item.addEventListener('pointermove', event => {
      if (!finePointer.matches || reduced.matches) return;
      cursor.classList.add('active');
      cursor.style.transform = `translate(${event.clientX - 38}px,${event.clientY - 38}px)`;
    });
    item.addEventListener('pointerleave', () => cursor.classList.remove('active'));
    item.addEventListener('click', () => cursor.classList.remove('active'));
  });

  // Filters animate the incoming set, without moving the layout's outer bounds.
  const grid = document.querySelector('.gallery-grid');
  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    if (reduced.matches) return;
    grid.classList.remove('is-filtering');
    requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.add('is-filtering')));
  }));
  grid.addEventListener('animationend', event => {
    const visible = [...grid.children].filter(item => !item.hidden);
    if (event.animationName === 'gallery-filter-in' && event.target === visible.at(-1)) grid.classList.remove('is-filtering');
  });

  // Accessible image comparison. Native range input supports touch and keyboard.
  const range = document.querySelector('#compare-range');
  const comparison = document.querySelector('.comparison');
  const reveal = document.querySelector('#reveal-transformation');
  let compareAnimation;
  function updateComparison(value) {
    const normalized = Math.max(0, Math.min(100, value));
    comparison.style.setProperty('--split', `${normalized}%`);
    range.value = String(Math.round(normalized));
    range.setAttribute('aria-valuetext', `${Math.round(normalized)}% antes e ${100 - Math.round(normalized)}% depois`);
    reveal.firstChild.textContent = normalized < 5 ? 'COMPARAR NOVAMENTE ' : 'REVELAR O BRAVO ';
  }
  range.addEventListener('input', () => { cancelAnimationFrame(compareAnimation); updateComparison(Number(range.value)); });
  let comparePointer = null;
  function setSplitFromPointer(event) {
    const box = comparison.getBoundingClientRect();
    updateComparison((event.clientX - box.left) / box.width * 100);
  }
  range.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    cancelAnimationFrame(compareAnimation);
    event.preventDefault();
    range.focus({ preventScroll: true });
    comparePointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: event.pointerType !== 'touch' };
    range.setPointerCapture?.(event.pointerId);
    if (comparePointer.dragging) setSplitFromPointer(event);
  });
  range.addEventListener('pointermove', event => {
    if (!comparePointer || comparePointer.id !== event.pointerId) return;
    const dx = Math.abs(event.clientX - comparePointer.x);
    const dy = Math.abs(event.clientY - comparePointer.y);
    if (!comparePointer.dragging && dx > 8 && dx > dy) comparePointer.dragging = true;
    if (comparePointer.dragging) { event.preventDefault(); setSplitFromPointer(event); }
  });
  range.addEventListener('pointerup', event => {
    if (!comparePointer || comparePointer.id !== event.pointerId) return;
    if (comparePointer.dragging || Math.abs(event.clientY - comparePointer.y) < 8) setSplitFromPointer(event);
    comparePointer = null;
    if (range.hasPointerCapture?.(event.pointerId)) range.releasePointerCapture(event.pointerId);
  });
  range.addEventListener('pointercancel', () => { comparePointer = null; });
  range.addEventListener('keydown', () => cancelAnimationFrame(compareAnimation));
  reveal.addEventListener('click', () => {
    cancelAnimationFrame(compareAnimation);
    const from = Number(range.value);
    const to = from < 5 ? 50 : 0;
    if (reduced.matches) { updateComparison(to); return; }
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / 850, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      updateComparison(from + (to - from) * eased);
      if (progress < 1) compareAnimation = requestAnimationFrame(frame);
    }
    compareAnimation = requestAnimationFrame(frame);
  });

  // Immediately stop enhanced motion if the system preference changes.
  reduced.addEventListener('change', event => {
    if (!event.matches) { scheduleMotion(); return; }
    cancelAnimationFrame(compareAnimation);
    cancelAnimationFrame(introFrame);
    clearTimeout(introTimer);
    document.documentElement.classList.remove('run-intro');
    cut.classList.remove('is-cutting');
    cursor.classList.remove('active');
    hidePreview();
    document.querySelectorAll('.hero-action .button, .appointment-side .button').forEach(button => { button.style.transform = ''; });
  });
})();
