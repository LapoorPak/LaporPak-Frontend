# LaporPak Frontend

Frontend web untuk LaporPak, platform pelaporan masalah fasilitas publik, infrastruktur, dan lingkungan agar laporan warga dapat diteruskan ke dinas terkait secara transparan.

---

## Overview

LaporPak Frontend menyediakan pengalaman web untuk tiga jenis pengguna:

- **Warga** membuat laporan, mengunggah foto bukti, memilih/menandai lokasi, dan memantau progres laporan.
- **Dinas/Petugas** melihat laporan masuk berbasis lokasi, memperbarui status, memberi catatan, dan mengunggah bukti penyelesaian.
- **Admin** mengelola data dinas, cabang, kategori laporan, pengguna, petugas, dan seluruh laporan lintas instansi.

---

## Tech Stack

| Area | Stack |
| --- | --- |
| Framework | React 19, Vite, TypeScript |
| Routing | React Router |
| Styling | Tailwind CSS, shadcn/ui-style components, Base UI |
| Data Fetching | TanStack Query, Axios |
| Forms & Validation | React Hook Form, Zod |
| Auth | Better Auth client integration |
| Maps | Mapbox GL, MapLibre GL, React Map GL |
| UI Feedback | Sonner, Framer Motion, GSAP |
| Deployment | Docker, Nginx |

---

## Features

- **Landing Page** - halaman publik dengan informasi LaporPak, alur pelaporan, dan pusat bantuan.
- **Citizen Auth** - registrasi, login, verifikasi email, dan session-aware route guard.
- **Citizen Dashboard** - buat laporan baru, unggah sampai 5 foto, pilih lokasi, lihat laporan saya, dan ikuti timeline status.
- **Map-based Reporting** - marker laporan dan pencarian lokasi untuk membantu pelacakan masalah publik.
- **Agency Portal** - dashboard dinas/petugas untuk memfilter laporan baru, diproses, butuh klarifikasi, dan selesai.
- **Report Follow-up** - update status laporan, catatan dinas, dan upload bukti penyelesaian.
- **Admin Dashboard** - ringkasan metrik sistem, distribusi status laporan, dan top dinas.
- **Master Data Admin** - CRUD dinas, cabang dinas, kategori laporan, pengguna, petugas, dan laporan.
- **Notifications** - unread count, daftar notifikasi, mark as read, dan mark all as read.
- **SEO** - meta tags, canonical URL, sitemap, robots.txt, manifest, dan structured data.

---

## Routes

| Path | Description |
| --- | --- |
| `/` | Landing page |
| `/cara-kerja` | Alur penggunaan LaporPak |
| `/bantuan` | Pusat bantuan |
| `/login` | Login warga |
| `/register` | Registrasi warga |
| `/verify-email` | Verifikasi email |
| `/dashboard` | Dashboard warga |
| `/agency/login` | Login dinas/petugas |
| `/agency/dashboard` | Dashboard dinas/petugas |
| `/admin/login` | Login admin |
| `/admin/dashboard` | Dashboard admin |
| `/admin/dinas` | Manajemen dinas |
| `/admin/cabang` | Manajemen cabang dinas |
| `/admin/kategori` | Manajemen kategori laporan |
| `/admin/users` | Manajemen pengguna dan petugas |
| `/admin/laporan` | Manajemen laporan |

---

## Environment Variables

Buat file `.env` dari `.env.example`.

```env
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_access_token
VITE_SITE_URL=https://web-laporpak.my.id
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL backend LaporPak. Frontend memakai `${VITE_API_URL}/api` untuk REST API. |
| `VITE_MAPBOX_TOKEN` | Token Mapbox untuk fitur peta dan pencarian lokasi. |
| `VITE_SITE_URL` | URL publik frontend untuk SEO, canonical URL, sitemap, dan structured data. |

---

## Getting Started

### Prerequisites

- Node.js `^24.0.0`
- npm
- Backend LaporPak berjalan dan dapat diakses dari `VITE_API_URL`
- Mapbox access token untuk fitur peta

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Vite akan menjalankan aplikasi di local development server.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Docker

Build image:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t laporpak-frontend .
```

Run container:

```bash
docker run -p 3000:3000 laporpak-frontend
```

The app is served by Nginx on port `3000`.

---

## Project Structure

```txt
src
|-- api              # API query functions and endpoint groups
|-- assets           # Custom icons and static React assets
|-- components       # Shared UI, layout, auth, and common components
|-- config           # Routes, SEO, React Query, and API client config
|-- constants        # Report, agency, and API constants
|-- data             # Static seed-like frontend data
|-- hooks            # Feature hooks for auth, reports, admin, notifications
|-- lib              # Utility helpers
|-- pages            # Page-level route modules
|-- types            # Shared frontend TypeScript types
```

---

## Related Repositories

| Repo | Stack | Description |
| --- | --- | --- |
| [LaporPak-Frontend](https://github.com/LapoorPak/LaporPak-Frontend) | React / Vite / TypeScript / Tailwind CSS | Web app for citizen, agency, and admin portals |
| [LaporPak-Backend](https://github.com/LapoorPak/LaporPak-Backend) | Express / TypeScript / Prisma / PostgreSQL / Better Auth | API, authentication, reports, agencies, users, notifications, and uploads |

---

## API Base URL

| Environment | URL |
| --- | --- |
| Local | `http://localhost:3000` |
| Production Frontend | `https://web-laporpak.my.id` |

---

## Status Flow

```txt
pending -> verified -> in_progress -> resolved
                    \-> clarification_requested
pending/verified/in_progress -> rejected
```

Frontend labels:

| Status | Label |
| --- | --- |
| `pending` | Menunggu |
| `verified` | Terverifikasi |
| `in_progress` | Diproses |
| `clarification_requested` | Butuh Klarifikasi |
| `resolved` | Selesai |
| `rejected` | Ditolak |
