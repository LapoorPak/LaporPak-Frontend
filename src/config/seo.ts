const DEFAULT_SITE_URL = "https://web-laporpak.my.id";

export const siteUrl = (
  import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, "");

export const siteName = "LaporPak";
export const siteImage = `${siteUrl}/logo_lightbg.png`;

export type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  path: string;
  noIndex?: boolean;
};

export const defaultSeo: SeoConfig = {
  title: "LaporPak - Platform Pelaporan Masalah Publik",
  description:
    "LaporPak adalah platform pelaporan masalah fasilitas publik, infrastruktur, dan lingkungan agar laporan warga diteruskan ke dinas terkait secara transparan.",
  keywords:
    "LaporPak, laporan warga, aduan publik, fasilitas publik, infrastruktur rusak, lingkungan, pelayanan publik",
  path: "/",
};

const routeSeo: Record<string, SeoConfig> = {
  "/": defaultSeo,
  "/cara-kerja": {
    title: "Cara Kerja LaporPak - Alur Pelaporan Warga",
    description:
      "Pelajari cara membuat laporan di LaporPak, mulai dari mengirim aduan, melacak status, hingga tindak lanjut oleh dinas terkait.",
    keywords:
      "cara lapor masalah publik, alur laporan warga, pelaporan fasilitas publik, tindak lanjut dinas",
    path: "/cara-kerja",
  },
  "/bantuan": {
    title: "Bantuan LaporPak - Pusat Bantuan Pelaporan Publik",
    description:
      "Temukan bantuan penggunaan LaporPak untuk mengirim laporan warga, mengelola akun, dan memahami proses pelaporan masalah publik.",
    keywords:
      "bantuan LaporPak, pusat bantuan laporan warga, panduan aduan publik, kontak LaporPak",
    path: "/bantuan",
  },
  "/login": {
    title: "Masuk Warga - LaporPak",
    description:
      "Masuk ke akun warga LaporPak untuk membuat dan memantau laporan masalah publik.",
    keywords: defaultSeo.keywords,
    path: "/login",
    noIndex: true,
  },
  "/register": {
    title: "Daftar Warga - LaporPak",
    description:
      "Buat akun warga LaporPak untuk mulai melaporkan masalah fasilitas publik, infrastruktur, dan lingkungan.",
    keywords: defaultSeo.keywords,
    path: "/register",
    noIndex: true,
  },
  "/verify-email": {
    title: "Verifikasi Email - LaporPak",
    description: "Verifikasi email akun LaporPak untuk melanjutkan penggunaan layanan.",
    keywords: defaultSeo.keywords,
    path: "/verify-email",
    noIndex: true,
  },
  "/agency/login": {
    title: "Portal Dinas - LaporPak",
    description:
      "Masuk ke portal dinas LaporPak untuk meninjau dan menindaklanjuti laporan warga.",
    keywords: defaultSeo.keywords,
    path: "/agency/login",
    noIndex: true,
  },
};

export function getSeoForPath(pathname: string): SeoConfig {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  return (
    routeSeo[cleanPath] ?? {
      title: "Halaman Tidak Ditemukan - LaporPak",
      description:
        "Halaman LaporPak yang Anda cari tidak tersedia. Kembali ke beranda untuk membuat atau memantau laporan publik.",
      keywords: defaultSeo.keywords,
      path: cleanPath,
      noIndex: true,
    }
  );
}

export function getCanonicalUrl(path: string) {
  const cleanPath = path === "/" ? "" : path;
  return `${siteUrl}${cleanPath}`;
}

export function getStructuredData(seo: SeoConfig) {
  const canonicalUrl = getCanonicalUrl(seo.path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: siteImage,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@laporpak.go.id",
          availableLanguage: ["id"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        inLanguage: "id-ID",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: seo.title,
        description: seo.description,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        inLanguage: "id-ID",
      },
    ],
  };
}
