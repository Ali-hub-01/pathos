/* ═════════════════════════════════════════════════════════════
   PATHOS CITY — интерактив
   ═════════════════════════════════════════════════════════════ */
'use strict';

/* ── Контакты ─────────────────────────────────────────────────
   TODO (Opus): когда клиент даст номер — вписать phone/whatsapp
   и переключить CTA/форму на wa.me/tel. Пока всё ведёт в Instagram. */
const CONTACT = {
  instagram: 'https://www.instagram.com/pathos.astana',
  phone: '+77758000555',
  whatsapp: '77758000555'   // основной канал связи (wa.me)
};

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ══════════ Шапка: фон при скролле ══════════ */
const head = $('#site-head');
const onScroll = () => head.classList.toggle('scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ══════════ Мобильное меню ══════════ */
const burger = $('#burger');
const nav = $('#head-nav');
const closeMenu = () => {
  burger.classList.remove('open');
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};
burger.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  burger.classList.toggle('open', open);
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) $$('a', nav).forEach((a, i) => { a.style.transitionDelay = (60 + i * 45) + 'ms'; });
});
$$('a', nav).forEach(a => a.addEventListener('click', closeMenu));

/* ══════════ Reveal по скроллу ══════════ */
if (!REDUCED && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));
} else {
  $$('[data-reveal]').forEach(el => el.classList.add('in'));
}

/* ══════════ Спотлайт за курсором (hero + караоке) ══════════ */
if (FINE_POINTER && !REDUCED) {
  const spots = [
    { zone: $('#hero'),    el: $('#hero-spot') },
    { zone: $('#karaoke'), el: $('#karaoke-spot') }
  ];
  spots.forEach(({ zone, el }) => {
    if (!zone || !el) return;
    zone.addEventListener('pointermove', ev => {
      const r = zone.getBoundingClientRect();
      el.style.setProperty('--sx', ((ev.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      el.style.setProperty('--sy', ((ev.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }, { passive: true });
  });
}

/* ══════════ Эквалайзер (canvas) ══════════ */
function equalizer(canvas, { bars = 64, amp = 0.9, hue = [201, 162, 75] } = {}) {
  if (!canvas || REDUCED) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, raf = 0, running = false, t = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const size = () => {
    const r = canvas.getBoundingClientRect();
    w = canvas.width = Math.round(r.width * dpr);
    h = canvas.height = Math.round(r.height * dpr);
  };
  size();
  window.addEventListener('resize', size, { passive: true });

  const draw = () => {
    if (!running) return;
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const p = i / bars;
      // псевдо-музыкальная огибающая из нескольких синусов
      const v = Math.abs(
        Math.sin(p * 9 + t * 1.9) * 0.45 +
        Math.sin(p * 23 - t * 1.3) * 0.3 +
        Math.sin(p * 4 + t * 0.7) * 0.25
      );
      const bh = Math.max(2 * dpr, v * h * amp);
      const x = i * bw + bw * 0.22;
      const alpha = 0.14 + v * 0.5;
      ctx.fillStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${alpha.toFixed(3)})`;
      const bwid = bw * 0.56;
      const rad = Math.min(bwid / 2, 3 * dpr);
      ctx.beginPath();
      ctx.roundRect(x, h - bh, bwid, bh, [rad, rad, 0, 0]);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };

  const vis = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; draw(); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0.05 });
  vis.observe(canvas);
}
equalizer($('#eq-hero'),    { bars: 96, amp: 0.8 });
equalizer($('#eq-karaoke'), { bars: 56, amp: 0.95, hue: [232, 200, 119] });

/* ══════════ Magnetic-кнопки ══════════ */
if (FINE_POINTER && !REDUCED) {
  $$('[data-magnetic]').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ══════════ Tilt-карточки ══════════ */
if (FINE_POINTER && !REDUCED) {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${py * -5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ══════════ VIP-рейл: drag + прогресс ══════════ */
const rail = $('#vip-rail');
const bar = $('#vip-bar');
if (rail) {
  const setBar = () => {
    if (!bar) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const p = max > 0 ? rail.scrollLeft / max : 0;
    bar.style.width = (16 + p * 84) + '%';
  };
  setBar();
  rail.addEventListener('scroll', setBar, { passive: true });

  if (FINE_POINTER) {
    let down = false, startX = 0, startL = 0, moved = false;
    rail.addEventListener('pointerdown', e => {
      down = true; moved = false;
      startX = e.clientX; startL = rail.scrollLeft;
      rail.classList.add('dragging');
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const d = e.clientX - startX;
      if (Math.abs(d) > 4) moved = true;
      rail.scrollLeft = startL - d;
    });
    window.addEventListener('pointerup', () => {
      down = false;
      rail.classList.remove('dragging');
    });
    rail.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
  }
}

/* Подгрузить все фото рейла заранее (нативный lazy не грузит карточки справа) */
if (rail && 'IntersectionObserver' in window) {
  const preload = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    preload.disconnect();
    $$('img', rail).forEach(img => { img.loading = 'eager'; });
  }, { rootMargin: '400px 0px' });
  preload.observe(rail);
}

/* ══════════ Счётчики ══════════ */
if (!REDUCED) {
  $$('.count').forEach(el => {
    const target = +el.dataset.count || 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1200;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });
}

/* ══════════ События: плавающее превью ══════════ */
const evFloat = $('#event-float');
const evImg = evFloat ? $('img', evFloat) : null;
if (evFloat && FINE_POINTER && !REDUCED) {
  let fx = 0, fy = 0, tx = 0, ty = 0, rafF = 0, showing = false;
  const loop = () => {
    fx += (tx - fx) * 0.14;
    fy += (ty - fy) * 0.14;
    evFloat.style.left = fx + 'px';
    evFloat.style.top = fy + 'px';
    rafF = showing ? requestAnimationFrame(loop) : 0;
  };
  $$('.event-row').forEach(row => {
    row.addEventListener('pointerenter', () => {
      evImg.src = row.dataset.img;
      showing = true;
      evFloat.classList.add('on');
      if (!rafF) rafF = requestAnimationFrame(loop);
    });
    row.addEventListener('pointerleave', () => {
      showing = false;
      evFloat.classList.remove('on');
    });
    row.addEventListener('pointermove', e => {
      tx = Math.min(e.clientX + 30, window.innerWidth - 260);
      ty = e.clientY - 140;
    }, { passive: true });
  });
}

/* ══════════ Галерея: лайтбокс ══════════ */
const lb = $('#lightbox');
const lbImg = $('#lb-img');
const shots = $$('#mosaic img');
let lbIdx = 0;
const openLb = i => {
  lbIdx = (i + shots.length) % shots.length;
  lbImg.src = shots[lbIdx].src;
  lbImg.alt = shots[lbIdx].alt;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
};
const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
shots.forEach((img, i) => img.closest('figure').addEventListener('click', () => openLb(i)));
if (lb) {
  $('#lb-close').addEventListener('click', closeLb);
  $('#lb-prev').addEventListener('click', () => openLb(lbIdx - 1));
  $('#lb-next').addEventListener('click', () => openLb(lbIdx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  window.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIdx - 1);
    if (e.key === 'ArrowRight') openLb(lbIdx + 1);
  });
}

/* ══════════ Форма бронирования ══════════ */
const form = $('#booking-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get('name') || '').toString().trim();
    const phone = (f.get('phone') || '').toString().trim();
    let ok = true;
    [['name', name], ['phone', phone]].forEach(([key, val]) => {
      const input = form.elements[key];
      input.classList.toggle('err', !val);
      if (!val) ok = false;
    });
    if (!ok) return;

    // Собираем аккуратное сообщение брони (пригодится для wa.me, когда появится номер)
    const msg = [
      'Здравствуйте! Хочу забронировать вечер в Pathos City.',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      f.get('date') ? `Дата: ${f.get('date')}` : '',
      f.get('guests') ? `Гостей: ${f.get('guests')}` : '',
      f.get('hall') ? `Зал: ${f.get('hall')}` : '',
      f.get('comment') ? `Комментарий: ${f.get('comment')}` : ''
    ].filter(Boolean).join('\n');

    if (CONTACT.whatsapp) {
      window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }

    // Google Ads: конверсия "Отправка формы для потенциальных клиентов"
    if (typeof window.gtag_report_lead === 'function') window.gtag_report_lead();

    $('#bf-done').hidden = false;
    form.querySelectorAll('input, select, textarea, button').forEach(el => { el.tabIndex = -1; });
  });
}

/* ══════════ Делегированные клики по CTA (для будущих gtag-конверсий) ══════════ */
document.addEventListener('click', e => {
  const cta = e.target.closest('[data-cta]');
  if (!cta) return;
  const type = cta.dataset.cta;
  // Google Ads: WhatsApp/Instagram → "Контакт"; tel: → "Интерактивные номера телефонов"
  if ((type === 'whatsapp' || type === 'instagram') && typeof window.gtag_report_contact === 'function') {
    window.gtag_report_contact();
  } else if (type === 'phone' && typeof window.gtag_report_phone === 'function') {
    window.gtag_report_phone();
  }
}, true);

/* ══════════ Год в футере ══════════ */
$('#year').textContent = new Date().getFullYear();
