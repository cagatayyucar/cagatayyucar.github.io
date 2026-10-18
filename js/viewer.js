// Real-time GLB viewers (Three.js). Loaded lazily from main.js; any failure falls back to a drawing.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { t, onLang } from './i18n.js';

const FX = 0xff7a1a;
const coarse = matchMedia('(pointer: coarse)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (k, dt) => 1 - Math.pow(k, dt);        // frame-rate independent smoothing

// How each model is shaded. `up: 'z'` = file was exported Z-up with no node transform.
const LOOK = {
  skid: { color: 0xc9ced6, metalness: 0.5, roughness: 0.36, up: 'y', yaw0: -0.55 },
  cip:  { color: 0x7d8998, metalness: 0.12, roughness: 0.5, up: 'y', yaw0: 0.5 },
  sk:   { color: 0xa9b0ba, metalness: 0.45, roughness: 0.42, up: 'z', yaw0: 0.55 },
};

// Hotspots (skid card only). p = point on the model in file coordinates (metres, y up), n = outward normal.
// A pin is shown only while its normal faces the camera, so it never floats behind the model.
// Camera presets that match the views on the technical drawings.
// n = model-local horizontal direction that should face the camera, pol = camera polar angle (0 = straight down).
const VIEWS = {
  cip: {
    top:   { n: [0, -1], pol: 0.26 },
    front: { n: [0, 1], pol: 1.5 },
    side:  { n: [0, -1], pol: 1.5 },
    under: { n: [0, -1], pol: 2.45 },
    iso:   { n: [0.55, 1], pol: 1.05 },
  },
  skid: {
    front: { n: [0, 1], pol: 1.5 },
    top:   { n: [0, 1], pol: 0.26 },
    endA:  { n: [1, 0], pol: 1.5 },
    endB:  { n: [-1, 0], pol: 1.5 },
    iso:   { n: [0.6, 1], pol: 1.1 },
  },
};

const HOTSPOTS = {
  skid: [
    { id: 'mem',   p: [-1.1, 1.43, 0.5],  n: [0, 0, 1] },
    { id: 'pump',  p: [1.6, 0.4, 0.5],    n: [0, 0, 1] },
    { id: 'valve', p: [0.64, 0.32, 0.5],  n: [0, 0, 1] },
    { id: 'frame', p: [-1.1, 0.1, 0.52],  n: [0, 0, 1] },
    { id: 'port',  p: [-0.95, 2.62, 0.05], n: [0, 1, 0.35] },
  ],
};

// ── model cache: each file is fetched and parsed once, then cloned per viewer
const loader = new GLTFLoader();
const cache = new Map();
const progressSubs = new Map();               // url -> Set of callbacks (0..1)
const onProgressEvt = (url) => (e) => {
  if (!e.total) return;
  const p = Math.min(1, e.loaded / e.total);
  progressSubs.get(url)?.forEach((fn) => fn(p));
};
function loadModel(url) {
  if (!cache.has(url)) {
    cache.set(url, loader.loadAsync(url, onProgressEvt(url)).then((g) => {
      // Some exporters write quantised accessor min/max in normalised units; GLTFLoader then scales them a second
      // time and the model ends up ~0 in size and frustum-culled. Recompute real bounds from the vertices.
      g.scene.traverse((o) => { if (o.isMesh && o.geometry) { o.geometry.computeBoundingBox(); o.geometry.computeBoundingSphere(); } });
      return g.scene;
    }).catch((e) => { cache.delete(url); throw e; }));
  }
  return cache.get(url);
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,122,26,.7)');
  gr.addColorStop(0.45, 'rgba(255,122,26,.2)');
  gr.addColorStop(1, 'rgba(255,122,26,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

// ── one shared render loop; only visible viewers draw
const viewers = new Set();
let rafId = 0, lastT = 0;
function loop(t) {
  rafId = requestAnimationFrame(loop);
  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;
  if (document.hidden) return;
  viewers.forEach((v) => { if (v.visible && v.ready) v.frame(dt, t); });
}
function ensureLoop() { if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(loop); } }

export function mountViewer(el, { model, hero = false, getProgress = () => 0, reduced = false, onReady, onFail, onProgress }) {
  const look = LOOK[model];
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { onFail?.(e); return null; }

  const dom = renderer.domElement;
  const dprMax = coarse ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  dom.setAttribute('aria-hidden', 'true');
  el.insertBefore(dom, el.firstChild);

  // Page scroll must keep working: wheel only zooms with Ctrl/Cmd (also trackpad pinch).
  // Registered before OrbitControls so it can stop the event first.
  dom.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey)) e.stopImmediatePropagation(); }, { capture: true, passive: true });

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 5);
  const fill = new THREE.DirectionalLight(0x9fb4ff, 0.6); fill.position.set(-5, 2, 3);
  const rim = new THREE.DirectionalLight(FX, hero ? 3.4 : 2.6); rim.position.set(-3, 2.5, -5);
  scene.add(key, fill, rim);

  const camera = new THREE.PerspectiveCamera(hero ? 30 : 34, 1, 0.01, 200);
  const spin = new THREE.Group();
  scene.add(spin);

  const v = {
    visible: false, ready: false, frame: () => {},
  };
  let controls = null;
  let radius = 1, size = new THREE.Vector3(1, 1, 1), dist = 5, mats = [];
  let auto = !reduced, interacting = false, lastInteract = 0;
  let angle = look.yaw0, scrollYaw = 0, heroYaw = look.yaw0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let sweep = null;                                   // intro "section cut"
  let hs = null;                                      // hotspot controller (skid card)
  let viewGoal = null;                                // {yaw, pol} while a drawing view is being shown

  // ── sizing
  function resize() {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    dist = (radius / Math.sin(Math.min(vf, hf) / 2)) * (hero ? 0.9 : 0.94);
    if (hero) {
      const narrow = w < 768;
      camera.setViewOffset(w, h, narrow ? 0 : -w * 0.14, narrow ? -h * 0.17 : -h * 0.04, w, h);
    }
    if (controls) {
      const dir = camera.position.clone().sub(controls.target);
      if (dir.lengthSq() > 0) camera.position.copy(controls.target).add(dir.normalize().multiplyScalar(dist));
      controls.minDistance = dist * 0.45;
      controls.maxDistance = dist * 1.7;
    }
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  const io = new IntersectionObserver((es) => { v.visible = es[0].isIntersecting; }, { rootMargin: '80px' });
  io.observe(el);

  function defaultView() {
    camera.position.set(0.55, 0.3, 1).normalize().multiplyScalar(dist);
    controls.target.set(0, 0, 0);
    controls.update();
    angle = look.yaw0; scrollYaw = 0;
  }

  // ── load
  if (onProgress) { const u = MODELS_URL[model]; if (!progressSubs.has(u)) progressSubs.set(u, new Set()); progressSubs.get(u).add(onProgress); }
  loadModel(MODELS_URL[model]).then((src) => {
    const obj = src.clone(true);
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const swap = (m) => {
        const c = m.clone();
        if (c.color) c.color.setHex(look.color);
        if ('metalness' in c) c.metalness = look.metalness;
        if ('roughness' in c) c.roughness = look.roughness;
        c.envMapIntensity = 1;
        mats.push(c);
        return c;
      };
      o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
    });
    if (look.up === 'z') obj.rotation.x = -Math.PI / 2;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    size = box.getSize(new THREE.Vector3());
    obj.position.sub(center);
    radius = size.length() / 2;
    spin.add(obj);

    const disc = new THREE.Mesh(
      new THREE.PlaneGeometry(radius * 3.4, radius * 3.4),
      new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6, toneMapped: false }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -size.y / 2 - radius * 0.004;
    scene.add(disc);

    if (hero && !reduced) {
      // Signature move: a section-cut plane sweeps across the model and draws it in.
      renderer.localClippingEnabled = true;
      const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -radius * 1.1);
      mats.forEach((m) => { m.clippingPlanes = [plane]; });
      const g = new THREE.PlaneGeometry(radius * 2.3, radius * 1.5);
      const quad = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: FX, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: FX, transparent: true, opacity: 0.95, toneMapped: false }));
      const cutter = new THREE.Group();
      cutter.rotation.y = Math.PI / 2;
      cutter.add(quad, edge);
      cutter.position.set(-radius * 1.1, size.y * 0.02, 0);
      scene.add(cutter);
      sweep = { plane, cutter, quad, edge, t: 0, dur: 2.6, done: false, R: radius * 1.1 };
    }

    if (!hero) {
      controls = new OrbitControls(camera, dom);
      controls.enableDamping = true; controls.dampingFactor = 0.07;
      controls.enablePan = false; controls.rotateSpeed = 0.8; controls.zoomSpeed = 0.8;
      controls.minPolarAngle = 0.25; controls.maxPolarAngle = Math.PI * 0.53;
      controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
      dom.style.touchAction = 'pan-y';                 // vertical swipe still scrolls the page on phones
      controls.addEventListener('start', () => { interacting = true; viewGoal = null; el.closest('.vcard')?.classList.add('touched'); });
      controls.addEventListener('end', () => { interacting = false; lastInteract = performance.now(); });
    }

    if (!isFinite(radius) || radius <= 0) throw new Error('model bounds invalid');
    resize();
    if (controls) defaultView();
    wireUi();
    if (controls && HOTSPOTS[model]) hs = initHotspots(obj);

    v.frame = frame;
    v.setView = (name) => {
      const d = VIEWS[model]?.[name];
      if (!d || !controls) return false;
      hs?.clear(true);
      auto = false; lastInteract = performance.now();
      el.closest('.vcard')?.querySelector('[data-act="auto"]')?.setAttribute('aria-pressed', 'false');
      el.closest('.vcard')?.classList.add('touched');
      const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));
      const aC = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
      const aN = Math.atan2(d.n[0], d.n[1]);
      const total = angle + scrollYaw;
      controls.target.set(0, 0, 0);
      viewGoal = { yaw: total + wrapPi(aC - aN - total), pol: d.pol };
      return true;
    };
    v.ready = true;
    frame(0.016, performance.now());                   // first paint before the loader hides
    console.info('[viewer]', model, { size: size.toArray().map((n) => +n.toFixed(3)), radius: +radius.toFixed(3), dist: +dist.toFixed(3),
      canvas: [dom.width, dom.height], box: [el.clientWidth, el.clientHeight], triangles: renderer.info.render.triangles, camera: camera.position.toArray().map((n) => +n.toFixed(2)) });
    if (!renderer.info.render.triangles) console.warn('[viewer] nothing was drawn for', model);
    onReady?.();
  }).catch((e) => { console.warn('[viewer]', model, e); cleanup(); onFail?.(e); });

  // ── per-frame
  function frame(dt) {
    if (sweep && !sweep.done) {
      sweep.t += dt;
      const k = clamp(sweep.t / sweep.dur);
      const c = lerp(-sweep.R, sweep.R, easeInOut(k));
      sweep.plane.constant = c;
      sweep.cutter.position.x = c;
      const fade = 1 - clamp((k - 0.82) / 0.18);
      sweep.quad.material.opacity = 0.2 * fade;
      sweep.edge.material.opacity = 0.95 * fade;
      if (k >= 1) {
        sweep.done = true;
        mats.forEach((m) => { m.clippingPlanes = null; m.needsUpdate = true; });
        renderer.localClippingEnabled = false;
        scene.remove(sweep.cutter);
      }
    }

    if (hero) {
      const p = getProgress();
      const e = easeInOut(clamp(p));
      pointer.x += (pointer.tx - pointer.x) * damp(0.002, dt);
      pointer.y += (pointer.ty - pointer.y) * damp(0.002, dt);
      const target = look.yaw0 + e * 2.1;
      heroYaw += (target - heroYaw) * damp(0.0008, dt);
      spin.rotation.y = heroYaw + pointer.x * 0.12;
      spin.rotation.x = pointer.y * 0.05;
      const d = dist * (1.04 - 0.3 * e);
      camera.position.set(0, d * (0.2 + 0.08 * e), d);
      camera.lookAt(0, -size.y * 0.02, 0);
    } else {
      if (!reduced) {
        const idle = !interacting && performance.now() - lastInteract > 2200;
        if (auto && idle && !hs?.focused()) angle += dt * 0.22;
        const r = el.getBoundingClientRect();
        const pv = clamp((innerHeight - r.top) / (innerHeight + r.height));
        if (!hs?.focused() && !viewGoal) scrollYaw += ((pv - 0.5) * 1.5 - scrollYaw) * damp(0.002, dt);
      }
      hs?.tick(dt);
      if (viewGoal) {
        const k = damp(0.0009, dt);
        angle += (viewGoal.yaw - scrollYaw - angle) * k;
        const off = camera.position.clone().sub(controls.target);
        const sp = new THREE.Spherical().setFromVector3(off);
        sp.phi += (viewGoal.pol - sp.phi) * k;
        sp.radius += (dist * 0.98 - sp.radius) * k;
        camera.position.copy(controls.target).add(off.setFromSpherical(sp));
        if (Math.abs(viewGoal.yaw - scrollYaw - angle) < 0.002 && Math.abs(viewGoal.pol - sp.phi) < 0.002) viewGoal = null;
      }
      spin.rotation.y = angle + scrollYaw;
      controls.update();
    }
    renderer.render(scene, camera);
    hs?.project();
  }

  // ── hotspots: pins that follow the model, click to fly the camera to a part
  function initHotspots(obj) {
    const list = HOTSPOTS[model];
    const card = el.closest('.vcard');
    el.setAttribute('role', 'group');
    const layer = document.createElement('div');
    layer.className = 'hs-layer';
    el.appendChild(layer);
    const panel = document.createElement('div');
    panel.className = 'hs-card glass-panel';
    panel.hidden = true;
    panel.innerHTML = '<div class="hs-head"><h4 class="hs-t"></h4><button type="button" class="hs-x icon-btn glass"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg></button></div><p class="hs-d"></p><button type="button" class="hs-next"></button>';
    (card || el).appendChild(panel);
    const pT = panel.querySelector('.hs-t'), pD = panel.querySelector('.hs-d'), pX = panel.querySelector('.hs-x'), pN = panel.querySelector('.hs-next');

    const items = list.map((h) => {
      const anchor = new THREE.Object3D();
      anchor.position.set(...h.p);
      obj.add(anchor);
      const wrap = document.createElement('div');
      wrap.className = 'hs-pin';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hs-dot';
      const tip = document.createElement('span');
      tip.className = 'hs-tip';
      btn.appendChild(tip);
      wrap.appendChild(btn);
      layer.appendChild(wrap);
      const it = { ...h, anchor, wrap, btn, tip, n: new THREE.Vector3(...h.n).normalize() };
      btn.addEventListener('click', (e) => { e.stopPropagation(); select(it); });
      return it;
    });

    let cur = null, selT = 0, yawTarget = 0, homing = false;
    const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), home = new THREE.Vector3(0, 0, 0);
    const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

    function label() {
      items.forEach((it) => { const n = t(`hs.${it.id}.t`); it.tip.textContent = n; it.btn.setAttribute('aria-label', n); });
      pX.setAttribute('aria-label', t('hs.close'));
      pN.textContent = t('hs.next');
      if (cur) { pT.textContent = t(`hs.${cur.id}.t`); pD.textContent = t(`hs.${cur.id}.d`); }
    }
    label();
    onLang(label);

    function select(it) {
      cur = it; homing = false; selT = 0;
      auto = false;
      card?.querySelector('[data-act="auto"]')?.setAttribute('aria-pressed', 'false');
      el.closest('.vcard')?.classList.add('touched');
      // turn the model so this part's normal faces where the camera already is
      const aC = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
      const aN = Math.atan2(it.n.x, it.n.z);
      const total = angle + scrollYaw;
      yawTarget = total + wrapPi(aC - aN - total);
      items.forEach((o) => o.btn.classList.toggle('active', o === it));
      pT.textContent = t(`hs.${it.id}.t`); pD.textContent = t(`hs.${it.id}.d`);
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('on'));
    }
    function clear(instant) {
      if (!cur) return;
      cur = null; homing = true; selT = 0;
      items.forEach((o) => o.btn.classList.remove('active'));
      panel.classList.remove('on');
      setTimeout(() => { if (!cur) panel.hidden = true; }, instant ? 0 : 350);
      lastInteract = performance.now();
    }
    pX.addEventListener('click', () => clear());
    pN.addEventListener('click', () => select(items[(items.indexOf(cur) + 1) % items.length]));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) clear(); });

    return {
      focused: () => !!cur,
      clear,
      tick(dt) {
        if (!cur && !homing) return;
        const k = damp(0.0009, dt);
        const old = tmp2.copy(controls.target);
        if (cur) {
          angle += (yawTarget - scrollYaw - angle) * k;
          spin.rotation.y = angle + scrollYaw;
          spin.updateMatrixWorld(true);
          cur.anchor.getWorldPosition(tmp);
        } else tmp.copy(home);
        controls.target.lerp(tmp, k);
        camera.position.add(tmp2.copy(controls.target).sub(old));
        selT += dt;
        if (selT < 1.4) {                                         // fly in / out, then hand zoom back to the visitor
          const off = tmp2.copy(camera.position).sub(controls.target);
          off.setLength(lerp(off.length(), cur ? dist * 0.5 : dist, k));
          camera.position.copy(controls.target).add(off);
        }
        if (!cur && controls.target.length() < 0.004) homing = false;
      },
      project() {
        const w = el.clientWidth, h = el.clientHeight;
        for (const it of items) {
          it.anchor.getWorldPosition(tmp);
          const facing = tmp2.copy(it.n).applyQuaternion(spin.quaternion).dot(tmp2.copy(camera.position).sub(tmp).normalize());
          tmp.project(camera);
          const on = facing > 0.18 && tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
          it.wrap.style.transform = `translate3d(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px, 0)`;
          if (on !== !it.wrap.hasAttribute('data-off')) it.wrap.toggleAttribute('data-off', !on);
        }
      },
    };
  }

  // ── card UI
  function wireUi() {
    const card = el.closest('.vcard');
    if (!card) return;
    card.querySelectorAll('[data-act]').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.dataset.act;
        if (act === 'auto') { auto = !auto; b.setAttribute('aria-pressed', String(auto)); if (auto) lastInteract = 0; }
        if (act === 'wire') {
          const on = b.getAttribute('aria-pressed') !== 'true';
          b.setAttribute('aria-pressed', String(on));
          mats.forEach((m) => { m.wireframe = on; });
        }
        if (act === 'reset') { hs?.clear(true); defaultView(); }
      });
    });
    if (reduced) card.querySelector('[data-act="auto"]')?.setAttribute('aria-pressed', 'false');
  }

  if (hero && !coarse) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  dom.addEventListener('webglcontextlost', (e) => { e.preventDefault(); v.ready = false; cleanup(); onFail?.(new Error('context lost')); });

  function cleanup() {
    viewers.delete(v);
    ro.disconnect(); io.disconnect();
    dom.remove();
    renderer.dispose();
  }

  viewers.add(v);
  ensureLoop();
  return v;
}

const MODELS_URL = {
  skid: 'models/ikili-uf-skid.glb',
  cip: 'models/cip-tanki.glb',
  sk: 'models/saseli-cip-tanki.glb',
};
