/* bilesen.js — küçük DOM çalışma zamanı. Üç iş yapar:
   1) Bilesen : state + setState + kareye toplanmış yeniden çizim.
   2) h()/yamala() : anahtarlı DOM yaması (odaktaki input imleci kaymaz).
   3) stilYaz()/metinYaz()/goster() : camelCase stil/metin yazma yardımcıları.

   React/Vue yok, derleme adımı yok — site düz statik HTML + ES modülüdür. */

const OLAY = {
  onClick: 'click', onChange: 'input', onInput: 'input',
  onBlur: 'blur', onFocus: 'focus', onKeyDown: 'keydown', onSubmit: 'submit'
};

/* ── vnode ─────────────────────────────────────────────────────────── */

export function h(etiket, ozellik, ...cocuklar) {
  const o = ozellik || {};
  return { etiket, ozellik: o, cocuklar: duzle(cocuklar), anahtar: o.key };
}

function duzle(liste, cikti = []) {
  for (const x of liste) {
    if (x == null || x === false || x === true) continue;
    if (Array.isArray(x)) duzle(x, cikti);
    else if (typeof x === 'object') cikti.push(x);
    else cikti.push({ etiket: '#metin', deger: String(x) });
  }
  return cikti;
}

const ayniTur = (a, b) => a.etiket === b.etiket;

/* ── stil ──────────────────────────────────────────────────────────── */

export function stilYaz(el, eski, yeni) {
  if (typeof yeni === 'string') {
    if (el.style.cssText !== yeni) el.style.cssText = yeni;
    return;
  }
  const e = (eski && typeof eski === 'object') ? eski : {};
  const y = yeni || {};
  for (const k in e) if (!(k in y)) el.style[k] = '';
  for (const k in y) if (e[k] !== y[k]) el.style[k] = y[k];
}

/* ── özellikler ────────────────────────────────────────────────────── */

function ozellikYaz(el, ad, deger, onceki) {
  if (ad === 'key' || ad === 'defaultValue') return;
  if (ad === 'ref') { if (deger) deger.current = el; return; }
  if (ad === 'style') { stilYaz(el, onceki, deger); return; }
  if (OLAY[ad]) {
    const tur = OLAY[ad];
    if (!el.__ol) el.__ol = {};
    const ilk = !(tur in el.__ol);
    el.__ol[tur] = typeof deger === 'function' ? deger : null;
    if (ilk) el.addEventListener(tur, (e) => { const f = el.__ol[tur]; if (f) f(e); });
    return;
  }
  if (ad === 'className') { if (el.className !== deger) el.className = deger || ''; return; }
  if (ad === 'value') {
    const s = deger == null ? '' : String(deger);
    if (el.value !== s) el.value = s;
    return;
  }
  if (ad === 'checked') { el.checked = !!deger; return; }
  if (ad === 'disabled') { el.disabled = !!deger; return; }
  if (deger == null || deger === false) el.removeAttribute(ad);
  else el.setAttribute(ad, deger === true ? '' : String(deger));
}

function ozellikleriUygula(el, eski, yeni) {
  const e = eski || {}, y = yeni || {};
  for (const ad in e) {
    if (ad in y) continue;
    if (ad === 'style') stilYaz(el, e.style, {});
    else if (OLAY[ad]) { if (el.__ol) el.__ol[OLAY[ad]] = null; }
    else if (ad === 'className') el.className = '';
    else if (ad !== 'key' && ad !== 'ref' && ad !== 'defaultValue') el.removeAttribute(ad);
  }
  for (const ad in y) ozellikYaz(el, ad, y[ad], e[ad]);
}

/* ── kurulum / güncelleme ──────────────────────────────────────────── */

function olustur(v) {
  if (v.etiket === '#metin') {
    v.dom = document.createTextNode(v.deger);
    return v.dom;
  }
  const el = document.createElement(v.etiket);
  ozellikleriUygula(el, null, v.ozellik);
  if (v.ozellik.defaultValue != null) el.value = v.ozellik.defaultValue;
  v.dom = el;
  yamala(el, v.cocuklar);
  return el;
}

function guncelle(eski, yeni) {
  const dom = eski.dom;
  yeni.dom = dom;
  if (yeni.etiket === '#metin') {
    if (dom.nodeValue !== yeni.deger) dom.nodeValue = yeni.deger;
    return dom;
  }
  ozellikleriUygula(dom, eski.ozellik, yeni.ozellik);
  yamala(dom, yeni.cocuklar);
  return dom;
}

/* Bir kabın çocuklarını yeni vnode listesine göre yamalar.
   Anahtarlı düğümler taşınır, anahtarsızlar sıra numarasıyla eşleşir. */
export function yamala(kap, cocuklar) {
  const eski = kap.__vc || [];
  const yeni = duzle(Array.isArray(cocuklar) ? cocuklar : [cocuklar]);

  const anahtarli = new Map();
  for (const v of eski) if (v.anahtar != null) anahtarli.set(v.anahtar, v);
  const kullanilan = new Set();

  for (let i = 0; i < yeni.length; i++) {
    const yv = yeni[i];
    let ev = null;
    if (yv.anahtar != null) {
      const aday = anahtarli.get(yv.anahtar);
      if (aday && !kullanilan.has(aday) && ayniTur(aday, yv)) ev = aday;
    } else {
      const aday = eski[i];
      if (aday && aday.anahtar == null && !kullanilan.has(aday) && ayniTur(aday, yv)) ev = aday;
    }
    if (ev) { kullanilan.add(ev); guncelle(ev, yv); }
    else olustur(yv);
  }

  for (const v of eski) {
    if (kullanilan.has(v)) continue;
    if (v.dom && v.dom.parentNode === kap) kap.removeChild(v.dom);
  }
  for (let i = 0; i < yeni.length; i++) {
    const hedef = kap.childNodes[i];
    if (hedef !== yeni[i].dom) kap.insertBefore(yeni[i].dom, hedef || null);
  }
  kap.__vc = yeni;
}

/* ── statik HTML'e metin yazma (data-bk="anahtar") ─────────────────── */

export function metinYaz(kok, veri, anahtarlar) {
  for (const ad of anahtarlar) {
    const el = kok.querySelector(`[data-bk="${ad}"]`);
    if (!el) continue;
    const s = veri[ad] == null ? '' : String(veri[ad]);
    if (el.textContent !== s) el.textContent = s;
  }
}

export function goster(el, kosul, gorunum = '') {
  if (!el) return;
  el.style.display = kosul ? gorunum : 'none';
}

/* ── bileşen tabanı ────────────────────────────────────────────────── */

export class Bilesen {
  constructor() {
    this.state = {};
    this._kare = 0;
  }
  setState(yama) {
    Object.assign(this.state, yama);
    this.ciz();
  }
  ciz() {
    if (this._kare) return;
    const calistir = () => {
      this._kare = 0;
      try { this.render(); } catch (e) { console.error(e); }
      if (this.guncellendi) { try { this.guncellendi(); } catch (e) { console.error(e); } }
    };
    this._kare = document.hidden ? setTimeout(calistir, 16) : requestAnimationFrame(calistir);
  }
}
