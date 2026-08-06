/* github.js — Detaylı GitHub istatistik widget'ı.
   Kaynak: api.github.com (CORS destekli, kimliksiz 60 istek/saat).
   Şu akışı çizer: avatar + isim + bio → büyük sayı kutuları (Repo/Yıldız/Fork/Takipçi)
   → dil dağılımı çubuğu → son aktivite listesi. API yanıt vermezse fallback görünümü. */

const KULLANICI = 'Lunixizm0';
const GORUNEN_AD = 'Utku Ceylan';
const SITE = 'https://github.com/' + KULLANICI;

const DIL_RENKLERI = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Go: '#00ADD8', Rust: '#dea584',
  C: '#555555', 'C++': '#f34b7d', Java: '#b07219', Shell: '#89e051',
  PHP: '#4F5D95', Ruby: '#701516', Kotlin: '#A97BFF', Swift: '#F05138',
  Dart: '#00B4AB', 'C#': '#178600', Vue: '#41b883', 'Jupyter Notebook': '#DA5B0B'
};

const sayiKisa = (n) => new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

function zamanFarki(iso) {
  const sn = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sn < 60) return 'az önce';
  const dk = Math.floor(sn / 60);
  if (dk < 60) return `${dk} dk önce`;
  const s = Math.floor(dk / 60);
  if (s < 24) return `${s} saat önce`;
  const g = Math.floor(s / 24);
  if (g < 30) return `${g} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

async function api(url) {
  const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/* Repolar sayfalı gelir (100'ü aşan hesaplar için Link header ile devam) */
async function tumRepolar() {
  const list = [];
  let url = `https://api.github.com/users/${KULLANICI}/repos?per_page=100&type=all&sort=updated`;
  for (let i = 0; i < 10; i++) {
    const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error(String(r.status));
    const veri = await r.json();
    list.push(...veri);
    const link = r.headers.get('Link') || '';
    const sonraki = link.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (!sonraki) break;
    url = sonraki[1];
  }
  return list;
}

function dilVer(repos) {
  const say = {};
  for (const r of repos) {
    const d = r.language;
    if (d) say[d] = (say[d] || 0) + 1;
  }
  return Object.entries(say)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ad, sayi]) => ({ ad, sayi, renk: DIL_RENKLERI[ad] || '#8b949e' }));
}

function aktiflik(events) {
  const metin = (e) => {
    const repo = (e.repo && e.repo.name) || '';
    const aksiyon = (e.payload && e.payload.action) || '';
    switch (e.type) {
      case 'PushEvent': return `${repo} üzerinde push yaptı`;
      case 'CreateEvent': return `${repo} oluşturdu`;
      case 'DeleteEvent': return `${repo} silindi`;
      case 'PullRequestEvent': return `${repo} için PR ${aksiyon}`;
      case 'IssuesEvent': return `${repo} için issue ${aksiyon}`;
      case 'StarEvent': return `${repo} repo'sunu yıldızladı`;
      case 'ForkEvent': return `${repo} repo'sunu fork'ladı`;
      case 'WatchEvent': return `${repo} repo'sunu izlemeye aldı`;
      case 'PublicEvent': return `${repo} repo'sunu herkese açtı`;
      case 'ReleaseEvent': return `${repo} için sürüm yayınladı`;
      default: return (e.type || '').replace('Event', '') + (repo ? ' · ' + repo : '');
    }
  };
  return (events || []).slice(0, 4).map((e) => ({
    metin: metin(e),
    zaman: zamanFarki(e.created_at)
  }));
}

function kutular(repos, user) {
  const yildiz = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const fork = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
  return [
    { sayi: repos.length, etiket: 'Repo' },
    { sayi: yildiz, etiket: 'Yıldız' },
    { sayi: fork, etiket: 'Fork' },
    { sayi: user.followers || 0, etiket: 'Takipçi' }
  ];
}

function el(ad, sinif, metin) {
  const n = document.createElement(ad);
  if (sinif) n.className = sinif;
  if (metin != null) n.textContent = metin;
  return n;
}

function gorunum({ user, repos, events }) {
  const dil = dilVer(repos);
  const dilToplam = dil.reduce((a, d) => a + d.sayi, 0);
  const aktif = aktiflik(events);

  const kok = el('div', 'github-widget');

  const baslikSatir = el('div', 'gw-ust-baslik');
  const gLogo = el('span', 'gw-logo', 'GitHub');
  const gLink = el('a', 'gw-gor', 'Profili gör ↗');
  gLink.href = SITE; gLink.target = '_blank'; gLink.rel = 'noopener';
  baslikSatir.append(gLogo, gLink);
  kok.appendChild(baslikSatir);

  const ust = el('div', 'gw-ust');
  const avatar = document.createElement('img');
  avatar.className = 'gw-avatar';
  avatar.src = user.avatar_url;
  avatar.alt = KULLANICI;
  avatar.loading = 'lazy';
  const bilgi = el('div', 'gw-bilgi');
  bilgi.appendChild(el('div', 'gw-isim', GORUNEN_AD));
  const kadi = el('a', 'gw-kullanici', '@' + KULLANICI);
  kadi.href = SITE; kadi.target = '_blank'; kadi.rel = 'noopener';
  bilgi.appendChild(kadi);
  if (user.bio) {
    const satirlar = user.bio.replace(/\r/g, '').split('\n').filter(Boolean);
    for (const satir of satirlar) bilgi.appendChild(el('span', 'gw-biyo', satir));
  }
  ust.append(avatar, bilgi);
  kok.appendChild(ust);

  const istat = el('div', 'gw-stats');
  for (const k of kutular(repos, user)) {
    const kart = el('div', 'gw-stat');
    kart.append(el('span', 'gw-sayi', sayiKisa(k.sayi)), el('span', 'gw-etiket', k.etiket));
    istat.appendChild(kart);
  }
  kok.appendChild(istat);

  if (dil.length) {
    const cubuk = el('div', 'gw-dil-cubuk');
    for (const d of dil) {
      const parca = el('i');
      parca.style.width = (d.sayi / dilToplam * 100) + '%';
      parca.style.background = d.renk;
      cubuk.appendChild(parca);
    }
    kok.appendChild(cubuk);

    const lejant = el('div', 'gw-dil-lejant');
    for (const d of dil) {
      const s = el('span', 'gw-dil-ad', `${d.ad} %${Math.round(d.sayi / dilToplam * 100)}`);
      s.style.color = d.renk;
      lejant.appendChild(s);
    }
    kok.appendChild(lejant);
  }

  if (aktif.length) {
    kok.appendChild(el('div', 'gw-alt-baslik', 'Son aktivite'));
    const liste = el('div', 'gw-aktif');
    for (const a of aktif) {
      const satir = el('div', 'gw-aktif-satir');
      satir.append(
        el('span', 'gw-aktif-nokta'),
        el('span', 'gw-aktif-metin', a.metin),
        el('span', 'gw-aktif-zaman', a.zaman)
      );
      liste.appendChild(satir);
    }
    kok.appendChild(liste);
  }

  return kok;
}

function hataGorunum() {
  const kok = el('div', 'github-widget github-widget--hata');
  kok.appendChild(el('p', null, 'GitHub istatistikleri şu an yüklenemedi.'));
  const a = el('a', 'gw-link', 'GitHub profilini aç →');
  a.href = SITE; a.target = '_blank'; a.rel = 'noopener';
  kok.appendChild(a);
  return kok;
}

async function yukle() {
  const kap = document.getElementById('bk-github');
  if (!kap) return;
  try {
    const [user, repos, events] = await Promise.all([
      api(`https://api.github.com/users/${KULLANICI}`),
      tumRepolar(),
      api(`https://api.github.com/users/${KULLANICI}/events/public?per_page=15`).catch(() => [])
    ]);
    kap.replaceChildren(gorunum({ user, repos, events }));
  } catch (e) {
    kap.replaceChildren(hataGorunum());
  }
}

yukle();
