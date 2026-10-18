// TR / EN dictionary and the language toggle logic.
// Keys with a "|" are headlines: each part becomes one masked line.
export const DICT = {
  tr: {
    'meta.title': 'Çağatay Uçar — Çevre ve Proje Mühendisi',
    'meta.desc': 'Çağatay Uçar: arıtma tesisleri için 3D tasarım, P&ID, izometrik, imalat çizimi ve FEA analizi. İnteraktif 3D modeller.',
    'skip': 'İçeriğe geç',
    'nav.about': 'Hakkımda', 'nav.software': 'Yazılım', 'nav.models': '3D modeller', 'nav.analysis': 'Analiz', 'nav.drawings': 'Çizimler', 'nav.contact': 'İletişim',
    'nav.menu': 'Menü', 'nav.home': 'Ana sayfa', 'lang.label': 'Dil',

    'hero.h1': 'Pikselden|Gerçek Tesise',
    'hero.sub': 'Çağatay Uçar. Çevre&Proje Mühendisi. 3D modelleme, borulama ve süreç tasarımı.',
    'hero.cta1': '3D modelleri incele', 'hero.cta2': 'İletişime geç',
    'hero.cap1.t': 'Tasarım', 'hero.cap1.d': 'AutoCAD Plant 3D’de 3D yerleşim, borulama ve malzeme listesi.',
    'hero.cap2.t': 'İmalat', 'hero.cap2.d': 'Flanş ve bağlantı elemanları, lazer kesime hazır çizimlerle.',
    'hero.cap3.t': 'Devreye alma', 'hero.cap3.d': 'Tesis çalışana kadar sahada, sonrasında işletmede.',
    'hero.model': 'Model: çift UF skid’i',
    'hero.alt': 'Çift UF skid’inin interaktif 3D modeli',

    'statement': 'Sızıntı suyu ve atıksu arıtma tesislerinde; 3D modellemeden imalat detaylandırmasına ve saha devreye almaya kadar uçtan uca mühendislik.',

    'about.h': 'Çevre|Mühendisinden',
    'about.p1': 'Çöp sızıntı suyu ve atıksu arıtma tesisleri projelerinde uzmanlaşan çalışma alanları:',
    'about.b1': 'AutoCAD Plant 3D altyapısıyla 3D yerleşim, borulama ve izometrik imalat projelerinin tasarlanması,',
    'about.b2': 'Hassas malzeme listeleri (BOM) ve teknik metrajların oluşturulması,',
    'about.b3': 'İmalatı tamamlanan tesislerin saha devreye alma ve işletme operasyonlarının gerçekleştirilmesi.',
    'about.focus': 'Uzmanlık alanları',
    'f1.t': 'Endüstriyel tesis tasarımı', 'f1.d': 'Yerleşim, borulama, ekipman',
    'f2.t': 'Atıksu ve sızıntı suyu arıtma', 'f2.d': 'UF, NF ve CIP hatları',
    'f4.t': '3D imalat modelleri', 'f4.d': 'Tank, skid ve şasi',
    'f5.t': 'Hidrostatik ve FEA analizi', 'f5.d': 'Fusion 360 simülasyonu',
    'f6.t': 'P&ID diyagramları', 'f6.d': 'Proses akış şemaları',
    'f7.t': 'Boru izometrikleri', 'f7.d': 'BOM ve kesim listesi',

    'sw.h': 'Çizim ve|Modelleme Araçları',
    'sw.sub': 'Çizimden imalata, borulamadan analize.',
    'sw.acad.d': '2D imalat çizimleri, flanş ve bağlantı elemanı profilleri; lazer kesim için hazırlama.',
    'sw.p3d.d': '3D borulama, P&ID, izometrik ve malzeme listesi (BOM) çıktıları.',
    'sw.f360.d': 'İmalat modelleri, hidrostatik basınç altında FEA simülasyonu ve teknik resim.',

    'm.h': 'Örnek 3D Modeller',
    'm.sub': 'Üretime giden modellerin kendisi, tarayıcıda gerçek zamanlı.',
    'm.hint.mouse': 'Sürükle: döndür. Ctrl + tekerlek: yakınlaştır.',
    'm.hint.touch': 'Yana kaydır: döndür. İki parmak: yakınlaştır.',
    'm.auto': 'Otomatik dönüş', 'm.reset': 'Görünümü sıfırla', 'm.wire': 'Tel kafes',
    'm.loading': 'Model yükleniyor', 'm.fail': '3D önizleme bu cihazda açılamadı. Yerine teknik resim gösteriliyor.',
    'm.skid.t': 'Çift UF skid’i',
    'm.skid.d': 'İkili ultrafiltrasyon skid’i: pompalar, membran modülleri, borulama ve şasi tek modelde.',
    'm.skid.c2': 'İkili UF hattı', 'm.skid.c3': 'Skid üzerinde',
    'm.cip.t': 'HDPE CIP tankı',
    'm.cip.d': 'Kimyasal yıkama operasyonları için özel nozul geçiş detayları',
    'm.sk.t': 'Şasili CIP tankı',
    'm.sk.d': 'Tank, taşıyıcı şasi ve nozul bağlantıları tek modelde.',
    'm.sk.c1': 'Şasi üzerinde', 'm.sk.c2': '3D imalat modeli',

    'fea.h': 'Kafanızda soru|işareti kalmasın.',
    'fea.p': 'Fusion ortamında gerçekleştirilen hidrolik ve statik simülasyonlar sayesinde, olası deformasyon noktaları üretim öncesi kusursuz şekilde analiz ediliyor.',
    'fea.cap': 'Fusion 360 simülasyonu, yer değiştirme animasyonu',
    'fea.legend': 'Yer değiştirme', 'fea.low': 'Düşük', 'fea.high': 'Yüksek', 'fea.hint': 'Kaydırdıkça simülasyon ilerler.',
    'fea.alt': 'Hidrostatik basınç altında tank cidarının Fusion 360 yer değiştirme animasyonu',
    'hs.close': 'Kapat', 'hs.next': 'Sonraki parça',
    'hs.mem.t': 'UF membran modülleri', 'hs.mem.d': 'Ultrafiltrasyonun yapıldığı yatay modül grubu. İki paralel hat, her hatta üst üste dizilmiş modüller.',
    'hs.pump.t': 'Pompa ve motor', 'hs.pump.d': 'Hattı besleyen pompa-motor grubu. Her UF hattında bir adet.',
    'hs.valve.t': 'Flanş bağlantıları', 'hs.valve.d': 'Boruları ve ekipmanları birbirine bağlayan flanşlı bağlantı noktaları.',
    'hs.frame.t': 'Taşıyıcı şasi', 'hs.frame.d': 'Modülleri ve borulamayı taşıyan çerçeve; tüm skid tek parça olarak taşınır.',
    'hs.port.t': 'Aktüatörlü vana', 'hs.port.d': 'Elle değil, aktüatörle açılıp kapanan hat vanası.',

    'pid.h': 'Tüm prosesi|tek sayfada gör.',
    'pid.p': 'UF, CIP ve NF hatlarını, pompaları, vanaları ve tankları gösteren P&ID. Yakından bakmak için şemaya dokun.',
    'pid.cap': 'UF, CIP ve NF hatlarının P&ID şeması',
    'pid.alt': 'UF, CIP ve NF hatlarını gösteren P&ID diyagramı',

    'd.h': 'İmalata hazır|teknik resimler.',
    'd.tank.t': 'CIP Tankı İmalatı',
    'd.tank.p': 'Farklı açılar, kesit detayları ve nozul ölçüleri. Çift cidar, kılıçlama ve alt destek ayrıntıları.',
    'd.tank.alt': 'CIP tankının imalat teknik resmi',
    'd.skid.t': 'UF skid montaj resmi',
    'd.skid.p': 'Üst, yan ve ön görünüşler ile izometrik. Pompalar, membran modülleri ve borulama tek sayfada.',
    'd.skid.alt': 'UF skid’inin görünüşleri ve izometriği',
    'd.open': '3D modeli aç',

    'iso.h': 'Boru izometrikleri,|malzeme listesiyle.',
    'iso.p': 'AutoCAD Plant 3D’den üretilen izometrikler. Malzeme listesi (BOM) ve kesim listesi aynı sayfada.',
    'iso.1.t': '63 mm PVC hat', 'iso.1.d': 'Te, flanş adaptörü, kelebek vana ve kesim listesi.',
    'iso.1.alt': '63 mm PVC hattın boru izometriği',
    'iso.2.t': '63 / 20 mm indirgemeli hat', 'iso.2.d': 'İndirgeme, dirsek ve flanş adaptörü; boru kesim ölçüleriyle.',
    'iso.2.alt': '63 ve 20 mm indirgemeli hattın boru izometriği',

    'c.h': 'Fikirleri dijitalden|gerçeğe taşıyalım.',
    'c.p': '3D modelleme, borulama projeleri ve mühendislik çözümleri için iletişim kanallarından ulaşabilirsiniz.',
    'c.mail': 'E-posta gönder', 'c.call': 'Ara', 'c.l.mail': 'E-posta', 'c.l.tel': 'Telefon',
    'f.rights': '© 2026 Çağatay Uçar', 'f.uni': 'Yıldız Teknik Üniversitesi, Çevre Mühendisliği', 'f.top': 'Başa dön',

    'zoom': 'Büyüt', 'lb.close': 'Kapat', 'lb.in': 'Yakınlaştır', 'lb.out': 'Uzaklaştır', 'lb.fit': 'Sığdır',
  },
  en: {
    'meta.title': 'Çağatay Uçar — Environmental & Project Engineer',
    'meta.desc': 'Çağatay Uçar: 3D design, P&ID, piping isometrics, fabrication drawings and FEA for treatment plants. Interactive 3D models.',
    'skip': 'Skip to content',
    'nav.about': 'About', 'nav.software': 'Software', 'nav.models': '3D models', 'nav.analysis': 'Analysis', 'nav.drawings': 'Drawings', 'nav.contact': 'Contact',
    'nav.menu': 'Menu', 'nav.home': 'Home', 'lang.label': 'Language',

    'hero.h1': 'From Pixel|to Real Plant',
    'hero.sub': 'Çağatay Uçar. Environmental & Project Engineer. 3D modeling, piping and process design.',
    'hero.cta1': 'Explore 3D models', 'hero.cta2': 'Get in touch',
    'hero.cap1.t': 'Design', 'hero.cap1.d': '3D layout, piping and bill of materials in AutoCAD Plant 3D.',
    'hero.cap2.t': 'Fabrication', 'hero.cap2.d': 'Flanges and fittings drawn ready for laser cutting.',
    'hero.cap3.t': 'Commissioning', 'hero.cap3.d': 'On site until the plant runs, then in operation.',
    'hero.model': 'Model: dual UF skid',
    'hero.alt': 'Interactive 3D model of the dual UF skid',

    'statement': 'End-to-end engineering for leachate and wastewater treatment plants: from 3D modeling to fabrication detailing and on-site commissioning.',

    'about.h': 'From an|Environmental Engineer',
    'about.p1': 'Specialized in landfill leachate and wastewater treatment plant projects, with work areas including:',
    'about.b1': 'Designing 3D layouts, piping and isometric fabrication projects with AutoCAD Plant 3D,',
    'about.b2': 'Producing precise bills of materials (BOM) and technical take-offs,',
    'about.b3': 'Carrying out on-site commissioning and operation of plants once fabrication is complete.',
    'about.focus': 'Focus areas',
    'f1.t': 'Industrial plant design', 'f1.d': 'Layout, piping, equipment',
    'f2.t': 'Wastewater and leachate treatment', 'f2.d': 'UF, NF and CIP lines',
    'f4.t': '3D manufacturing models', 'f4.d': 'Tanks, skids, frames',
    'f5.t': 'Hydrostatic and FEA analysis', 'f5.d': 'Fusion 360 simulation',
    'f6.t': 'P&ID diagrams', 'f6.d': 'Process flow schematics',
    'f7.t': 'Piping isometrics', 'f7.d': 'BOM and cut lists',

    'sw.h': 'Drawing and|Modeling Tools',
    'sw.sub': 'From drawing to fabrication, from piping to analysis.',
    'sw.acad.d': '2D fabrication drawings, flange and fitting profiles, prepared for laser cutting.',
    'sw.p3d.d': '3D piping, P&ID, isometric and bill of materials (BOM) output.',
    'sw.f360.d': 'Manufacturing models, FEA under hydrostatic pressure and technical drawings.',

    'm.h': 'Sample 3D Models',
    'm.sub': 'The actual production models, in real time in your browser.',
    'm.hint.mouse': 'Drag to rotate. Ctrl + wheel to zoom.',
    'm.hint.touch': 'Swipe sideways to rotate. Pinch to zoom.',
    'm.auto': 'Auto-rotate', 'm.reset': 'Reset view', 'm.wire': 'Wireframe',
    'm.loading': 'Loading model', 'm.fail': 'The 3D preview couldn’t start on this device. Showing the technical drawing instead.',
    'm.skid.t': 'Dual UF skid',
    'm.skid.d': 'Dual ultrafiltration skid: pumps, membrane modules, piping and frame in one model.',
    'm.skid.c2': 'Dual UF train', 'm.skid.c3': 'Skid-mounted',
    'm.cip.t': 'HDPE CIP tank',
    'm.cip.d': 'Special nozzle transition details for chemical cleaning operations',
    'm.sk.t': 'Skid-mounted CIP tank',
    'm.sk.d': 'Tank, load-bearing frame and nozzle connections in a single model.',
    'm.sk.c1': 'Skid-mounted', 'm.sk.c2': '3D manufacturing model',

    'fea.h': 'Leave no room|for doubt.',
    'fea.p': 'Hydraulic and static simulations run in Fusion analyze possible deformation points flawlessly before production.',
    'fea.cap': 'Fusion 360 simulation, displacement animation',
    'fea.legend': 'Displacement', 'fea.low': 'Low', 'fea.high': 'High', 'fea.hint': 'The simulation advances as you scroll.',
    'fea.alt': 'Fusion 360 displacement animation of the tank wall under hydrostatic pressure',
    'hs.close': 'Close', 'hs.next': 'Next part',
    'hs.mem.t': 'UF membrane modules', 'hs.mem.d': 'The horizontal module bank where ultrafiltration happens. Two parallel trains, with modules stacked in each.',
    'hs.pump.t': 'Pump and motor', 'hs.pump.d': 'The pump-motor set feeding the line. One in each UF train.',
    'hs.valve.t': 'Flange connections', 'hs.valve.d': 'Flanged connection points that join pipes and equipment.',
    'hs.frame.t': 'Support frame', 'hs.frame.d': 'The frame carrying the modules and piping, so the whole skid moves as one piece.',
    'hs.port.t': 'Actuated valve', 'hs.port.d': 'A line valve opened and closed by an actuator instead of by hand.',

    'pid.h': 'The whole process|on one sheet.',
    'pid.p': 'A P&ID showing the UF, CIP and NF lines, pumps, valves and tanks. Tap the sheet to look closer.',
    'pid.cap': 'P&ID of the UF, CIP and NF lines',
    'pid.alt': 'P&ID diagram showing the UF, CIP and NF lines',

    'd.h': 'Fabrication-ready|technical drawings.',
    'd.tank.t': 'CIP Tank Fabrication',
    'd.tank.p': 'Different views, section details and nozzle sizes. Double wall, stiffening and bottom support details.',
    'd.tank.alt': 'Fabrication drawing of the CIP tank',
    'd.skid.t': 'UF skid assembly drawing',
    'd.skid.p': 'Top, side and front views plus an isometric. Pumps, membrane modules and piping on one sheet.',
    'd.skid.alt': 'Views and isometric of the UF skid',
    'd.open': 'Open the 3D model',

    'iso.h': 'Piping isometrics,|bill of materials included.',
    'iso.p': 'Isometrics generated from AutoCAD Plant 3D, with the BOM and cut-piece list on the same sheet.',
    'iso.1.t': '63 mm PVC line', 'iso.1.d': 'Tees, flange adaptors, a butterfly valve and the cut list.',
    'iso.1.alt': 'Piping isometric of a 63 mm PVC line',
    'iso.2.t': '63 / 20 mm reduced line', 'iso.2.d': 'Reducing bushes, an elbow and a flange adaptor, with pipe cut lengths.',
    'iso.2.alt': 'Piping isometric of a 63 and 20 mm reduced line',

    'c.h': 'Let’s take ideas|from digital to real.',
    'c.p': 'For 3D modeling, piping projects and engineering solutions, reach out through the contact channels.',
    'c.mail': 'Send an email', 'c.call': 'Call', 'c.l.mail': 'Email', 'c.l.tel': 'Phone',
    'f.rights': '© 2026 Çağatay Uçar', 'f.uni': 'Yıldız Technical University, Environmental Engineering', 'f.top': 'Back to top',

    'zoom': 'Enlarge', 'lb.close': 'Close', 'lb.in': 'Zoom in', 'lb.out': 'Zoom out', 'lb.fit': 'Fit',
  },
};

const KEY = 'cu-lang';
let current = 'en';
const listeners = new Set();

export const t = (k) => DICT[current][k] ?? DICT.tr[k] ?? k;
export const lang = () => current;
export const onLang = (fn) => listeners.add(fn);

function renderHeading(el, text) {
  el.textContent = '';
  text.split('|').forEach((line, i) => {
    const ln = document.createElement('span');
    ln.className = 'ln';
    ln.style.setProperty('--i', i);
    const inner = document.createElement('span');
    inner.textContent = line;
    ln.appendChild(inner);
    el.appendChild(ln);
  });
  // screen readers get one sentence, not split lines
  el.setAttribute('aria-label', text.replace('|', ' '));
}

export function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-h]').forEach((el) => renderHeading(el, t(el.dataset.i18nH)));
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  document.documentElement.lang = current;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.desc'));
  document.querySelectorAll('[data-lang-btn]').forEach((b) => {
    const on = b.dataset.langBtn === current;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.querySelectorAll('.lang').forEach((l) => l.setAttribute('data-active', current));
}

export function setLang(l, { persist = true } = {}) {
  if (!DICT[l]) return;
  current = l;
  if (persist) { try { localStorage.setItem(KEY, l); } catch (_) { /* private mode */ } }
  apply();
  listeners.forEach((fn) => fn(l));
}

export function initLang() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) { /* ignore */ }
  const q = new URLSearchParams(location.search).get('lang');
  current = DICT[q] ? q : (DICT[saved] ? saved : 'en');
  apply();
  document.querySelectorAll('[data-lang-btn]').forEach((b) =>
    b.addEventListener('click', () => setLang(b.dataset.langBtn)));
}
