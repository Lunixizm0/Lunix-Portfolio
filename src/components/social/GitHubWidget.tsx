import React, { useEffect, useState } from "react";
import {
  GwYukleniyor,
  GwUstBaslik,
  GwLogo,
  GwGor,
  GwUst,
  GwAvatar,
  GwBilgi,
  GwIsim,
  GwKullanici,
  GwBiyo,
  GwStats,
  GwStat,
  GwSayi,
  GwEtiket,
  GwDilCubuk,
  GwDilLejant,
  GwAltBaslik,
  GwAktif,
  GwAktifSatir,
  GwAktifNokta,
  GwAktifMetin,
  GwAktifZaman,
  GithubHata,
  GwLink,
} from "../styles/Social.styled";

const KULLANICI = "Lunixizm0";
const GORUNEN_AD = "Utku Ceylan";
const SITE = "https://github.com/" + KULLANICI;

const DIL_RENKLERI: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  Java: "#b07219",
  Shell: "#89e051",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  "C#": "#178600",
  Vue: "#41b883",
  "Jupyter Notebook": "#DA5B0B",
};

type GhUser = { avatar_url: string; bio: string | null; followers: number };
type GhRepo = {
  language: string | null;
  stargazers_count: number;
  forks_count: number;
};
type GhEvent = {
  type: string;
  repo?: { name?: string };
  payload?: { action?: string };
  created_at: string;
};

type Veri = {
  user: GhUser;
  repos: GhRepo[];
  events: GhEvent[];
};

const sayiKisa = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

function zamanFarki(iso: string): string {
  const sn = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sn < 60) return "az önce";
  const dk = Math.floor(sn / 60);
  if (dk < 60) return `${dk} dk önce`;
  const s = Math.floor(dk / 60);
  if (s < 24) return `${s} saat önce`;
  const g = Math.floor(s / 24);
  if (g < 30) return `${g} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

async function api<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as T;
}

/* Repolar sayfalı gelir (100'ü aşan hesaplar için Link header ile devam) */
async function tumRepolar(): Promise<GhRepo[]> {
  const list: GhRepo[] = [];
  let url = `https://api.github.com/users/${KULLANICI}/repos?per_page=100&type=all&sort=updated`;
  for (let i = 0; i < 10; i++) {
    const r = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!r.ok) throw new Error(String(r.status));
    const veri = (await r.json()) as GhRepo[];
    list.push(...veri);
    const link = r.headers.get("Link") || "";
    const sonraki = link.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (!sonraki) break;
    url = sonraki[1];
  }
  return list;
}

function dilVer(repos: GhRepo[]) {
  const say: Record<string, number> = {};
  for (const r of repos) {
    const d = r.language;
    if (d) say[d] = (say[d] || 0) + 1;
  }
  return Object.entries(say)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([ad, sayi]) => ({ ad, sayi, renk: DIL_RENKLERI[ad] || "#8b949e" }));
}

function aktiflik(events: GhEvent[]) {
  const metin = (e: GhEvent): string => {
    const repo = (e.repo && e.repo.name) || "";
    const aksiyon = (e.payload && e.payload.action) || "";
    switch (e.type) {
      case "PushEvent":
        return `${repo} üzerinde push yaptı`;
      case "CreateEvent":
        return `${repo} oluşturdu`;
      case "DeleteEvent":
        return `${repo} silindi`;
      case "PullRequestEvent":
        return `${repo} için PR ${aksiyon}`;
      case "IssuesEvent":
        return `${repo} için issue ${aksiyon}`;
      case "StarEvent":
        return `${repo} repo'sunu yıldızladı`;
      case "ForkEvent":
        return `${repo} repo'sunu fork'ladı`;
      case "WatchEvent":
        return `${repo} repo'sunu izlemeye aldı`;
      case "PublicEvent":
        return `${repo} repo'sunu herkese açtı`;
      case "ReleaseEvent":
        return `${repo} için sürüm yayınladı`;
      default:
        return (e.type || "").replace("Event", "") + (repo ? " · " + repo : "");
    }
  };
  return (events || []).slice(0, 4).map(e => ({
    metin: metin(e),
    zaman: zamanFarki(e.created_at),
  }));
}

function kutular(repos: GhRepo[], user: GhUser) {
  const yildiz = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const fork = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
  return [
    { sayi: repos.length, etiket: "Repo" },
    { sayi: yildiz, etiket: "Yıldız" },
    { sayi: fork, etiket: "Fork" },
    { sayi: user.followers || 0, etiket: "Takipçi" },
  ];
}

const GitHubWidget: React.FC = () => {
  const [durum, setDurum] = useState<"yukleniyor" | "hata" | "ok">(
    "yukleniyor"
  );
  const [veri, setVeri] = useState<Veri | null>(null);

  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const [user, repos, events] = await Promise.all([
          api<GhUser>(`https://api.github.com/users/${KULLANICI}`),
          tumRepolar(),
          api<GhEvent[]>(
            `https://api.github.com/users/${KULLANICI}/events/public?per_page=15`
          ).catch(() => []),
        ]);
        if (!iptal) {
          setVeri({ user, repos, events });
          setDurum("ok");
        }
      } catch {
        if (!iptal) setDurum("hata");
      }
    })();
    return () => {
      iptal = true;
    };
  }, []);

  if (durum === "yukleniyor")
    return <GwYukleniyor>GitHub istatistikleri yükleniyor…</GwYukleniyor>;

  if (durum === "hata" || !veri) {
    return (
      <GithubHata>
        <p>GitHub istatistikleri şu an yüklenemedi.</p>
        <GwLink href={SITE} target="_blank" rel="noopener noreferrer">
          GitHub profilini aç →
        </GwLink>
      </GithubHata>
    );
  }

  const { user, repos, events } = veri;
  const dil = dilVer(repos);
  const dilToplam = dil.reduce((a, d) => a + d.sayi, 0);
  const aktif = aktiflik(events);

  return (
    <div>
      <GwUstBaslik>
        <GwLogo>GitHub</GwLogo>
        <GwGor href={SITE} target="_blank" rel="noopener noreferrer">
          Profili gör ↗
        </GwGor>
      </GwUstBaslik>

      <GwUst>
        <GwAvatar src={user.avatar_url} alt={KULLANICI} loading="lazy" />
        <GwBilgi>
          <GwIsim>{GORUNEN_AD}</GwIsim>
          <GwKullanici href={SITE} target="_blank" rel="noopener noreferrer">
            @{KULLANICI}
          </GwKullanici>
          {user.bio &&
            user.bio
              .replace(/\r/g, "")
              .split("\n")
              .filter(Boolean)
              .map(satir => <GwBiyo key={satir}>{satir}</GwBiyo>)}
        </GwBilgi>
      </GwUst>

      <GwStats>
        {kutular(repos, user).map(k => (
          <GwStat key={k.etiket}>
            <GwSayi>{sayiKisa(k.sayi)}</GwSayi>
            <GwEtiket>{k.etiket}</GwEtiket>
          </GwStat>
        ))}
      </GwStats>

      {dil.length > 0 && (
        <>
          <GwDilCubuk>
            {dil.map(d => (
              <i
                key={d.ad}
                style={{
                  width: `${(d.sayi / dilToplam) * 100}%`,
                  background: d.renk,
                }}
              />
            ))}
          </GwDilCubuk>
          <GwDilLejant>
            {dil.map(d => (
              <span key={d.ad} style={{ color: d.renk }}>
                {d.ad} %{Math.round((d.sayi / dilToplam) * 100)}
              </span>
            ))}
          </GwDilLejant>
        </>
      )}

      {aktif.length > 0 && (
        <>
          <GwAltBaslik>Son aktivite</GwAltBaslik>
          <GwAktif>
            {aktif.map((a, i) => (
              <GwAktifSatir key={i}>
                <GwAktifNokta />
                <GwAktifMetin>{a.metin}</GwAktifMetin>
                <GwAktifZaman>{a.zaman}</GwAktifZaman>
              </GwAktifSatir>
            ))}
          </GwAktif>
        </>
      )}
    </div>
  );
};

export default GitHubWidget;
