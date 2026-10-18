import { initLang, t, lang, onLang, apply } from './i18n.js';
import { CONTACT } from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = document.documentElement.classList.contains('rm');
const state = { hp: 0 };                       // smoothed hero progress (0..1)

/* ───────── language + contact ───────── */
initLang();
$('#mail-link').href = `mailto:${CONTACT.email}`;
$('#tel-link').href = `tel:${CONTACT.phone}`;

/* ───────── nav ───────── */
const nav = $('#nav');
const menuBtn = $('#menu-btn');
const menu = $('#menu');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth >= 768) setMenu(false); });

/* ───────── reveals (entrance, once) ───────── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    io.unobserve(en.target);
  });
}, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
$$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--si', i)));
$$('.rv, [data-fade], [data-stagger], [data-reveal-card]').forEach((el) => io.observe(el));
// the hero headline should never wait for a threshold
requestAnimationFrame(() => $$('.hero .rv, .hero [data-fade]').forEach((el) => el.classList.add('in')));

/* ───────── statement: words light up with scroll ───────── */
const stTrack = $('#statement-track');
const stText = $('#statement-text');
let words = [];
function buildWords() {
  stText.textContent = '';
  words = t('statement').split(' ').map((w, i, a) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    stText.append(s, i < a.length - 1 ? ' ' : '');
    return s;
  });
}
buildWords();
onLang(buildWords);

/* ───────── FEA: Fusion animation scrubbed by scroll (65 pre-rendered frames) ───────── */
const feaTrack = $('#fea-track');
const feaCanvas = $('#fea-canvas');
const feaView = feaCanvas.closest('.fea-view');
const feaMarker = $('#fea-marker');
const feaBar = $('.fea-bar');
const FEA_N = 65;
const feaImgs = new Array(FEA_N);
const feaCtx = feaCanvas.getContext('2d');
let feaLoading = false, feaShown = -1, feaP = 0;
if (!feaCtx || reduced) feaView.classList.add('fallback');
function feaLoad() {
  if (feaLoading || !feaCtx) return;
  feaLoading = true;
  const order = [0, FEA_N - 1, ...Array.from({ length: FEA_N - 2 }, (_, i) => i + 1)];   // both ends first
  let k = 0;
  const next = () => {
    if (k >= order.length) return;
    const i = order[k++];
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { feaImgs[i] = im; feaShown = -1; next(); };
    im.onerror = next;
    im.src = `img/fea/f${String(i).padStart(2, '0')}.webp`;
  };
  for (let c = 0; c < 4; c++) next();                                                     // 4 downloads in parallel
}
function feaDraw(idx) {
  let j = idx;
  while (j >= 0 && !feaImgs[j]) j--;
  if (j < 0) { j = idx; while (j < FEA_N && !feaImgs[j]) j++; }
  if (j < 0 || j >= FEA_N || j === feaShown) return;
  feaShown = j;
  feaCtx.drawImage(feaImgs[j], 0, 0, feaCanvas.width, feaCanvas.height);
}
function feaFrame(vh) {
  const fr = feaTrack.getBoundingClientRect();
  if (fr.top < vh * 2 && fr.bottom > -vh) feaLoad();
  const raw = reduced ? 1 : clamp(-fr.top / Math.max(1, fr.height - vh));
  const target = clamp((raw - 0.06) / 0.8);                                               // hold both ends briefly
  feaP += (target - feaP) * (reduced ? 1 : 0.18);
  if (Math.abs(target - feaP) < 0.0005) feaP = target;
  if (feaCtx && !reduced) feaDraw(Math.round(feaP * (FEA_N - 1)));
  feaMarker.style.left = `${(feaP * 100).toFixed(2)}%`;
  feaBar.setAttribute('aria-valuenow', String(Math.round(feaP * 100)));
}

/* ───────── pointer spotlight on tiles ───────── */
$$('[data-spot]').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ───────── scroll frame ───────── */
const hero = $('#top');
const heroTrack = $('#hero-track');
const heroRail = $('#hero-rail-fill');
const caps = $$('.cap', hero);
const progress = $('#progress');
const themed = $$('main [data-theme]');
const zooms = $$('[data-zoomin]');
let capOn = 0;
let navTheme = '';

function frame() {
  const vh = innerHeight;

  // page progress
  const max = document.documentElement.scrollHeight - vh;
  progress.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;

  // nav colour follows the section underneath it
  const probe = 26;
  let th = 'dark';
  for (const s of themed) {
    const r = s.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) th = s.dataset.theme;
  }
  if (th !== navTheme) { navTheme = th; nav.dataset.theme = th; }

  // hero
  const hr = heroTrack.getBoundingClientRect();
  const raw = clamp(-hr.top / Math.max(1, hr.height - vh));
  state.hp += (raw - state.hp) * (reduced ? 1 : 0.14);
  if (Math.abs(raw - state.hp) < 0.0004) state.hp = raw;
  hero.style.setProperty('--hp', state.hp.toFixed(4));
  heroRail.style.transform = `scaleY(${state.hp.toFixed(4)})`;
  const idx = raw < 0.3 ? 0 : raw < 0.64 ? 1 : 2;
  if (idx !== capOn) { capOn = idx; caps.forEach((c, i) => c.classList.toggle('is-on', i === idx)); }

  // statement words
  const sr = stTrack.getBoundingClientRect();
  const sp = clamp(-sr.top / Math.max(1, sr.height - vh));
  const lit = reduced ? words.length : Math.round(clamp((sp - 0.06) / 0.72) * words.length);
  for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);

  // drawings scale up into place
  for (const z of zooms) {
    const r = z.getBoundingClientRect();
    const k = clamp((vh - r.top) / (vh * 0.62));
    z.style.setProperty('--z', (1 - Math.pow(1 - k, 3)).toFixed(3));
  }

  feaFrame(vh);
}
function loop() { requestAnimationFrame(loop); if (!document.hidden) frame(); }
loop();

/* ───────── lightbox ───────── */
const lb = $('#lb'), stage = $('#lb-stage'), limg = $('#lb-img'), lcap = $('#lb-cap');
let sc = 1, fit = 1, tx = 0, ty = 0, openCap = '', openAlt = '';
const pts = new Map();
let pinch = 0;
const paint = () => { limg.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`; };
function layout() {
  const sw = stage.clientWidth, sh = stage.clientHeight;
  if (!limg.naturalWidth) return;
  limg.style.width = `${limg.naturalWidth}px`; limg.style.height = `${limg.naturalHeight}px`;
  fit = Math.min(sw / limg.naturalWidth, sh / limg.naturalHeight) * 0.96;
  sc = fit; tx = (sw - limg.naturalWidth * sc) / 2; ty = (sh - limg.naturalHeight * sc) / 2;
  paint();
}
function zoomAt(f, cx, cy) {
  const ns = clamp(sc * f, fit * 0.8, fit * 8);
  const k = ns / sc;
  tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; sc = ns; paint();
}
const center = () => ({ x: stage.clientWidth / 2, y: stage.clientHeight / 2 });
function openLb(src, capKey, altKey) {
  openCap = capKey; openAlt = altKey;
  lcap.textContent = t(capKey);
  limg.alt = t(altKey);
  limg.onload = layout;
  limg.src = src;
  document.documentElement.style.overflow = 'hidden';
  lb.showModal();
  if (limg.complete) layout();
}
function closeLb() { lb.close(); }
lb.addEventListener('close', () => { document.documentElement.style.overflow = ''; pts.clear(); });
lb.addEventListener('cancel', () => { document.documentElement.style.overflow = ''; });
$('#lb-close').addEventListener('click', closeLb);
$('#lb-fit').addEventListener('click', layout);
$('#lb-in').addEventListener('click', () => { const c = center(); zoomAt(1.4, c.x, c.y); });
$('#lb-out').addEventListener('click', () => { const c = center(); zoomAt(1 / 1.4, c.x, c.y); });
addEventListener('resize', () => { if (lb.open) layout(); });
onLang(() => { if (lb.open) { lcap.textContent = t(openCap); limg.alt = t(openAlt); } });
$$('[data-lightbox]').forEach((b) => b.addEventListener('click', () => openLb(b.dataset.lightbox, b.dataset.cap, b.dataset.alt)));

stage.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = stage.getBoundingClientRect();
  zoomAt(e.deltaY < 0 ? 1.16 : 1 / 1.16, e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
stage.addEventListener('dblclick', (e) => {
  const r = stage.getBoundingClientRect();
  if (sc > fit * 1.5) layout(); else zoomAt(2.6, e.clientX - r.left, e.clientY - r.top);
});
stage.addEventListener('pointerdown', (e) => {
  stage.setPointerCapture(e.pointerId);
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  stage.classList.add('drag');
  if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
});
stage.addEventListener('pointermove', (e) => {
  const p = pts.get(e.pointerId);
  if (!p) return;
  if (pts.size === 1) {
    tx += e.clientX - p.x; ty += e.clientY - p.y; paint();
  } else if (pts.size === 2) {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [a, b] = [...pts.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const r = stage.getBoundingClientRect();
    if (pinch) zoomAt(d / pinch, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    pinch = d;
    return;
  }
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
});
const up = (e) => { pts.delete(e.pointerId); pinch = 0; if (!pts.size) stage.classList.remove('drag'); };
stage.addEventListener('pointerup', up);
stage.addEventListener('pointercancel', up);

/* ───────── 3D viewers (Three.js from CDN, lazy, always with a fallback) ───────── */
const failCard = (el) => {
  const card = el.closest('.vcard');
  el.classList.add('no-3d');
  if (!card) return;
  card.classList.add('no-3d');
  const s = $('.viewer-state span', card);
  if (s) { s.dataset.i18n = 'm.fail'; apply(card); }
};
let viewerMod = null;
function getViewerModule() {
  viewerMod ??= import('./viewer.js');
  return viewerMod;
}
async function mount(el, hero) {
  if (el.dataset.mounted) return;
  el.dataset.mounted = '1';
  let mod;
  try { mod = await getViewerModule(); } catch (e) { console.warn('[3D] could not load Three.js', e); failCard(el); return; }
  mod.mountViewer(el, {
    model: el.dataset.model,
    hero,
    reduced,
    getProgress: () => state.hp,
    onProgress: (p) => {
      const pct = Math.round(p * 100);
      (el.closest('.hero-stage') || el).style.setProperty('--load', p.toFixed(3));
      const lbl = el.closest('.vcard')?.querySelector('.viewer-state span');
      if (lbl && !el.classList.contains('no-3d')) lbl.textContent = `${t('m.loading')} ${pct}%`;
    },
    onReady: () => { el.classList.add('ready'); el.closest('.vcard')?.classList.add('ready') },
    onFail: () => failCard(el),
  });
}
const heroEl = $('#view-hero');
const startHero = () => mount(heroEl, true);
if (document.readyState === 'complete') setTimeout(startHero, 60);
else addEventListener('load', () => setTimeout(startHero, 60), { once: true });

const cardIO = new IntersectionObserver((es) => {
  es.forEach((en) => { if (en.isIntersecting) { cardIO.unobserve(en.target); mount(en.target, false); } });
}, { rootMargin: '700px 0px' });
$$('[data-viewer="card"]').forEach((el) => cardIO.observe(el));

