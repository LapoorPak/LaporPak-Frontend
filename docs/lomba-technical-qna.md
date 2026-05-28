# LaporPak - Technical Q&A Lomba

Dokumen ini disiapkan buat latihan menjawab pertanyaan teknis juri. Gaya jawabnya sengaja dibuat ringkas, percaya diri, dan tetap jujur soal batasan sistem.

## 1. Elevator Pitch Teknis

**Pertanyaan:** LaporPak itu secara teknis apa?

**Jawaban:**
LaporPak adalah platform pelaporan masalah publik berbasis web. Warga bisa membuat laporan dengan foto dan lokasi, sistem backend memvalidasi laporan dengan AI, mengklasifikasikan kategori laporan, lalu me-routing laporan ke dinas atau cabang dinas yang relevan. Petugas dinas punya dashboard peta dan feed untuk memproses laporan, memberi catatan, meminta klarifikasi, menyelesaikan laporan dengan bukti foto, sementara admin mengelola master data dinas, cabang, kategori, user, dan laporan.

**Kalimat kunci:**
Frontend fokus ke pengalaman pengguna dan visualisasi laporan. Backend menjadi sumber kebenaran untuk autentikasi, otorisasi, validasi bisnis, routing laporan, upload file, notifikasi, dan integrasi AI.

## 2. Gambaran Arsitektur

```txt
Warga / Dinas / Admin
        |
        v
React + Vite Frontend
- portal warga
- portal dinas
- portal admin
- map dashboard
- social/feed view
        |
        | HTTPS + cookie session
        v
Express + TypeScript Backend
- REST API
- Better Auth session
- role middleware
- report workflow
- AI review
- notification service
- upload service
        |
        +--> PostgreSQL + Prisma
        |
        +--> S3-compatible object storage
        |
        +--> Gemini API
        |
        +--> SMTP email
        |
        +--> Mapbox/search service via frontend
```

## 3. Tech Stack

| Area | Stack | Alasan |
| --- | --- | --- |
| Frontend | React 19, Vite, TypeScript | Cepat untuk SPA, type-safe, build ringan |
| Styling | Tailwind CSS, shadcn-style components, Base UI | Konsisten, cepat bikin UI dashboard |
| Data Fetching | TanStack Query, Axios | Cocok untuk server state, caching, pagination, invalidation |
| Routing | React Router | Portal warga, dinas, admin bisa dipisah rapi |
| Map | Mapbox GL, MapLibre GL, React Map GL | Visualisasi laporan berbasis koordinat |
| Auth Client | Better Auth client | Session-aware route guard |
| Backend | Node.js, Express 5, TypeScript | REST API fleksibel dan familiar untuk lomba/MVP |
| Database | PostgreSQL, Prisma | Relasional, query aman, migrasi jelas |
| Auth Server | Better Auth | Session cookie dan integrasi user/session/account |
| Upload | Multer memory upload + S3-compatible bucket | File tidak disimpan permanen di server app |
| AI | Google GenAI / Gemini | Review laporan berbasis teks dan gambar |
| Email | Nodemailer SMTP | Verifikasi email/OTP |
| Security | Helmet, CORS, role middleware | Proteksi HTTP dasar dan pembatasan akses |
| Deployment | Docker, Nginx untuk FE, Node service untuk BE | Mudah dipindah ke VPS atau platform cloud |

## 4. Alur End-to-End

### Warga membuat laporan

1. Warga login sebagai role `warga`.
2. Warga mengisi judul, deskripsi, lokasi, kategori opsional, dan maksimal 5 foto.
3. Frontend mengirim `multipart/form-data` ke `POST /api/reports`.
4. Backend upload foto ke bucket.
5. Backend memanggil Gemini untuk memvalidasi teks dan gambar.
6. Jika valid, laporan masuk status `verified`; jika tidak valid, status `rejected`.
7. Backend menentukan kategori/cabang dinas dan membuat timeline.
8. Petugas dinas mendapat notifikasi laporan baru.

### Dinas memproses laporan

1. Petugas dinas login ke `/agency/dashboard`.
2. Frontend mengambil data dari `/api/reports/locations` dan `/api/reports/dashboard`.
3. Petugas melihat laporan di peta, filter status, scope `mine/all`, dan search.
4. Petugas update status lewat `/api/reports/:id/status`.
5. Jika selesai, petugas wajib mengirim catatan dan bukti foto ke `/api/reports/:id/resolve`.
6. Backend update status, membuat timeline, menyimpan bukti resolusi, dan mengirim notifikasi.

### Admin mengelola sistem

1. Admin login ke portal admin.
2. Admin bisa melihat overview, laporan, dinas, cabang, kategori, user, dan assignment petugas.
3. Admin punya akses lebih luas untuk operasional dan master data.

## 5. Pertanyaan Arsitektur

**Pertanyaan:** Kenapa frontend dan backend dipisah?

**Jawaban:**
Karena tanggung jawabnya beda. Frontend fokus ke pengalaman pengguna seperti form laporan, dashboard peta, feed, filter, dan detail tiket. Backend fokus ke aturan bisnis seperti validasi role, validasi status, upload, routing dinas, AI review, database, dan notifikasi. Pemisahan ini juga memudahkan deployment dan scaling: frontend bisa di CDN/static hosting, backend bisa diskalakan sebagai API service.

**Pertanyaan:** Sistem ini monolith atau microservices?

**Jawaban:**
Untuk tahap MVP/lomba, backend dibuat sebagai modular monolith. Modulnya sudah dipisah: auth, report, admin, agency, upload, notification, dan category. Ini lebih sederhana untuk dikembangkan dan didemokan, tapi masih cukup rapi kalau nanti perlu dipisah menjadi service tersendiri.

**Pertanyaan:** Kenapa pakai REST API?

**Jawaban:**
Karena workflow LaporPak kebanyakan CRUD dan action-based: create report, list reports, update status, resolve, vote, rating, notification read. REST lebih mudah dipahami, dites, dan dipresentasikan. Untuk kebutuhan realtime nanti bisa ditambah WebSocket atau server-sent events tanpa mengubah fondasi utama.

## 6. Pertanyaan Frontend

**Pertanyaan:** Kenapa pakai TanStack Query?

**Jawaban:**
Data laporan, notifikasi, dashboard, dan lokasi itu server state. TanStack Query membantu caching, loading state, pagination/infinite query, refetch, dan invalidasi cache setelah mutation. Contohnya setelah dinas update status laporan, frontend menjalankan `invalidateQueries` untuk refresh data locations dan dashboard.

**Pertanyaan:** Bedanya state lokal React dan server state di LaporPak?

**Jawaban:**
State lokal dipakai untuk UI sementara seperti selected marker, active tabs, search input, draft status, catatan dinas, preview foto, dan lightbox. Server state dipakai untuk data yang sumbernya backend seperti daftar laporan, lokasi laporan, dashboard summary, session, dan notifikasi.

**Pertanyaan:** Kenapa dashboard dinas berbasis peta?

**Jawaban:**
Karena laporan publik sangat terkait lokasi. Peta membantu petugas melihat persebaran masalah, prioritas area, cabang dinas terdekat, dan konteks geografis. Selain peta, sistem juga menyediakan feed/list supaya laporan tetap mudah dibaca kalau user tidak ingin melihat peta.

**Pertanyaan:** Bagaimana frontend mencegah UI lag saat search?

**Jawaban:**
Search input menggunakan debounced value sekitar 400ms, jadi query atau filtering tidak langsung dieksekusi setiap keypress. Untuk feed, data juga menggunakan infinite query sehingga tidak semua data harus dimuat sekaligus.

**Pertanyaan:** Kalau user tidak memberi izin GPS, aplikasi masih bisa dipakai?

**Jawaban:**
Bisa. GPS hanya fitur bantu untuk menampilkan lokasi user. Jika permission ditolak, user tetap bisa melihat peta, mencari lokasi, dan memilih titik laporan secara manual.

**Pertanyaan:** Apa fungsi `scope` di dashboard dinas?

**Jawaban:**
`mine` menampilkan laporan yang relevan dengan dinas/cabang petugas. `all` dipakai untuk melihat konteks lebih luas, tetapi permission edit tetap ditentukan backend. Jadi meskipun user bisa melihat lebih luas, aksi sensitif tetap dibatasi.

## 7. Pertanyaan Backend & API

**Pertanyaan:** Backend LaporPak mengurus apa saja?

**Jawaban:**
Backend mengurus autentikasi, session, role authorization, laporan, status workflow, upload foto, AI review, routing dinas/cabang, notifikasi, dashboard dinas, dashboard admin, CRUD master data, dan health check.

**Pertanyaan:** Endpoint penting apa saja?

**Jawaban:**
- `POST /api/reports`: warga membuat laporan.
- `GET /api/reports/me`: warga melihat laporan sendiri.
- `GET /api/reports/locations`: data lokasi laporan untuk peta/feed.
- `GET /api/reports/dashboard`: dashboard laporan dinas.
- `POST /api/reports/:id/status`: dinas update status.
- `POST /api/reports/:id/resolve`: dinas menyelesaikan laporan dengan bukti foto.
- `POST /api/reports/:id/clarification`: warga menjawab permintaan klarifikasi.
- `POST /api/reports/:id/vote`: warga memberi upvote/downvote.
- `POST /api/reports/:id/rating`: warga memberi rating setelah laporan selesai.
- `GET /api/notifications`: daftar notifikasi.
- `GET /api/admin/...`: operasional admin.

**Pertanyaan:** Kenapa validasi tidak cukup di frontend?

**Jawaban:**
Karena frontend bisa dimanipulasi lewat DevTools atau request langsung seperti Postman. Frontend hanya untuk UX. Validasi utama tetap di backend: role user, hak edit laporan, status yang boleh dipakai, ukuran/tipe file, dan kewajiban catatan/bukti foto.

**Pertanyaan:** Bagaimana error ditangani?

**Jawaban:**
Backend melempar error terstruktur dengan status HTTP seperti 400, 401, 403, 404, atau 500. Frontend membaca pesan error dan menampilkan toast yang manusiawi, misalnya gagal update tiket atau laporan tidak ditemukan.

## 8. Auth, Role, dan Security

**Pertanyaan:** Role apa saja di sistem?

**Jawaban:**
Secara garis besar ada `warga`, `admin`, dan role dinas/petugas. Di backend, role selain `warga` dan `admin` dianggap sebagai agency/staff role, selama user terhubung ke data petugas dinas.

**Pertanyaan:** Bagaimana melindungi route dinas/admin?

**Jawaban:**
Frontend punya `AuthGuard` untuk UX: user yang belum login diarahkan ke login, user yang role-nya tidak sesuai diarahkan ke dashboard yang benar. Backend tetap punya middleware `requireAuth`, `requireAgencyRole`, `requireAdminRole`, dan `requireCitizenRole`, jadi akses API tetap aman walaupun frontend diakali.

**Pertanyaan:** Kalau user biasa mencoba update status laporan lewat Postman?

**Jawaban:**
Backend akan menolak. Endpoint update status memakai `requireAuth` dan `requireAgencyRole`. Selain itu, backend mengecek apakah laporan boleh diedit oleh petugas terkait lewat pengecekan dinas/cabang.

**Pertanyaan:** Bagaimana cookie/session dipakai?

**Jawaban:**
Frontend menggunakan Axios dengan `withCredentials: true`, sehingga session cookie dari Better Auth ikut terkirim ke backend. Backend membaca session dari header/cookie melalui Better Auth, lalu menempelkan user dan session ke request.

**Pertanyaan:** Proteksi security apa yang sudah ada?

**Jawaban:**
Ada Helmet untuk HTTP security headers, CORS dengan daftar origin yang diizinkan, session-based auth, role middleware, validasi file upload, dan server-side authorization. Untuk produksi, tambahan yang disarankan adalah rate limiting, audit log detail, monitoring, backup policy, dan secret rotation.

## 9. Status dan Workflow Laporan

**Pertanyaan:** Status laporan apa saja?

**Jawaban:**
Status utama adalah:
- `pending`: laporan baru dibuat/masuk proses awal.
- `verified`: laporan lolos validasi.
- `in_progress`: sedang ditangani dinas.
- `clarification_requested`: dinas meminta info tambahan dari warga.
- `resolved`: laporan selesai.
- `rejected`: laporan ditolak.

**Pertanyaan:** Kenapa endpoint resolve dipisah dari update status biasa?

**Jawaban:**
Karena menyelesaikan laporan punya syarat khusus: wajib ada catatan penyelesaian dan bukti foto resolusi. Backend sengaja menolak status `resolved` lewat endpoint update status biasa, supaya laporan tidak bisa asal ditandai selesai tanpa bukti.

**Pertanyaan:** Bagaimana timeline laporan dibuat?

**Jawaban:**
Setiap perubahan penting dibuat sebagai entry timeline, misalnya laporan dibuat warga, diverifikasi AI, diproses dinas, diminta klarifikasi, warga memberi klarifikasi, atau laporan diselesaikan. Timeline membuat proses transparan untuk warga dan admin.

**Pertanyaan:** Kalau dinas meminta klarifikasi, apa yang terjadi?

**Jawaban:**
Status menjadi `clarification_requested`, warga mendapat notifikasi, lalu warga bisa mengirim catatan klarifikasi dan foto tambahan. Setelah klarifikasi masuk, status kembali ke `in_progress` supaya dinas bisa lanjut menangani.

## 10. AI Review

**Pertanyaan:** AI dipakai untuk apa?

**Jawaban:**
AI dipakai sebagai lapisan validasi awal dan klasifikasi laporan. Gemini membaca judul, deskripsi, dan foto bukti untuk menilai apakah laporan cukup jelas, serius, relevan dengan fasilitas publik, dan cocok dengan kategori resmi. Jika valid, AI membantu memilih kategori. Jika tidak valid, laporan ditolak dengan alasan dan saran perbaikan.

**Pertanyaan:** Kenapa butuh AI?

**Jawaban:**
Karena platform pengaduan rentan spam, laporan bercanda, foto tidak relevan, dan laporan yang terlalu ambigu. AI membantu mengurangi beban petugas di tahap awal, sehingga petugas lebih fokus pada laporan yang layak diproses.

**Pertanyaan:** Apakah AI menjadi satu-satunya pengambil keputusan?

**Jawaban:**
Untuk MVP ini AI menjadi filter awal, tetapi sistem tetap menyimpan reasoning dan metadata AI supaya keputusan bisa diaudit. Untuk produksi pemerintahan, rekomendasi terbaik adalah tetap menyediakan jalur review manual untuk kasus borderline atau laporan yang ditolak tetapi diajukan ulang.

**Pertanyaan:** Kalau AI gagal atau Gemini down?

**Jawaban:**
Backend punya fallback. Jika validasi visual wajib tidak bisa dilakukan, sistem mengembalikan keputusan konservatif: laporan tidak langsung diterima hanya dari teks. Ini lebih aman untuk mencegah spam, tapi untuk produksi bisa ditambah antrean retry atau manual review.

**Pertanyaan:** Kenapa gambar dibatasi?

**Jawaban:**
Frontend membatasi maksimal 5 foto, dan backend juga membatasi upload maksimal 5 file dengan ukuran 5MB per file serta hanya menerima JPEG, PNG, dan WebP. Ini mencegah biaya storage/AI membengkak dan mengurangi risiko file berbahaya.

**Pertanyaan:** Model AI apa yang dipakai?

**Jawaban:**
Backend menggunakan Google GenAI/Gemini. Di kode saat ini service memanggil model Gemini untuk multimodal review laporan, karena sistem perlu memahami teks dan gambar sekaligus.

## 11. Routing Dinas dan Lokasi

**Pertanyaan:** Bagaimana laporan diarahkan ke dinas?

**Jawaban:**
Pertama, AI atau input manual menentukan kategori laporan. Kategori terhubung ke dinas. Lalu backend mencari cabang dinas berdasarkan tipe dinas dan koordinat laporan. Sistem mengecek wilayah, jarak menggunakan formula haversine, dan coverage radius cabang. Hasilnya bisa `auto_assigned`, `manual_review`, atau `failed`.

**Pertanyaan:** Kenapa pakai haversine distance?

**Jawaban:**
Karena laporan dan cabang dinas punya latitude/longitude. Haversine cukup ringan dan cocok untuk menghitung jarak antar titik di permukaan bumi tanpa perlu dependency geospasial berat untuk MVP.

**Pertanyaan:** Kalau laporan di luar coverage cabang?

**Jawaban:**
Sistem memilih kandidat cabang terdekat tetapi memberi status `manual_review`. Artinya sistem tetap memberi rekomendasi, namun petugas/admin perlu meninjau assignment-nya.

**Pertanyaan:** Bagaimana validasi koordinat?

**Jawaban:**
Frontend memfilter laporan yang punya latitude/longitude valid sebelum ditampilkan di map. Backend menyimpan latitude/longitude sebagai angka dan punya index database untuk query lokasi. Untuk produksi, validasi rentang koordinat Indonesia/Jakarta bisa diperketat di backend.

## 12. Database

**Pertanyaan:** Tabel utama apa saja?

**Jawaban:**
Tabel utama meliputi:
- `MsUser`: user warga, admin, dan petugas.
- `TrSession`, `MsAccount`, `TrVerification`: kebutuhan Better Auth.
- `MsDinas`: data dinas.
- `MsCabangDinas`: cabang dinas, koordinat, coverage, petugas.
- `MsKategoriLaporan`: kategori laporan dan relasi ke dinas.
- `TrLaporan`: laporan utama.
- `TrLaporanTimeline`: riwayat status.
- `TrLaporanRoutingDecision`: catatan keputusan routing.
- `TrNotification`: notifikasi user.
- `TrLaporanVote`: voting laporan.
- `TrLaporanRating`: rating setelah laporan selesai.
- `MsPetugasDinas`: relasi user petugas ke cabang dinas.

**Pertanyaan:** Kenapa pakai PostgreSQL?

**Jawaban:**
Data LaporPak relasional: user, laporan, dinas, cabang, kategori, timeline, notifikasi, vote, rating. PostgreSQL cocok karena kuat untuk relasi, indexing, transaksi, dan query agregasi dashboard.

**Pertanyaan:** Kenapa pakai Prisma?

**Jawaban:**
Prisma memberi schema yang jelas, migration, type-safe query, dan memudahkan join/relasi. Untuk tim lomba, ini membantu mengurangi bug query manual dan membuat struktur database lebih mudah dijelaskan.

**Pertanyaan:** Index apa yang penting?

**Jawaban:**
Index penting ada di `createdById`, `kategoriId + status`, `cabangDinasId + status`, `routingStatus + createdAt`, `latitude + longitude`, serta index notifikasi berdasarkan `userId + isRead` dan `userId + createdAt`. Ini mendukung query dashboard, peta, dan notifikasi.

## 13. Upload dan Storage

**Pertanyaan:** Foto disimpan di mana?

**Jawaban:**
Backend menerima file lewat Multer memory storage, lalu mengupload file ke S3-compatible object storage. Database hanya menyimpan URL/path file, bukan binary file. Ini membuat backend lebih ringan dan storage lebih scalable.

**Pertanyaan:** Bagaimana mencegah file berbahaya?

**Jawaban:**
Backend membatasi MIME type ke JPEG, PNG, dan WebP, membatasi ukuran 5MB per file, dan membatasi jumlah file maksimal 5. Di produksi, bisa ditambah antivirus scanning, image re-encoding, dan signed URL untuk akses privat.

**Pertanyaan:** Kenapa tidak simpan gambar langsung di database?

**Jawaban:**
Karena gambar bisa besar dan sering diakses sebagai static asset. Object storage lebih cocok untuk file binary, sedangkan database cukup menyimpan metadata dan URL.

## 14. Notifikasi

**Pertanyaan:** Notifikasi dipakai untuk apa?

**Jawaban:**
Notifikasi memberi tahu petugas ketika ada laporan baru, warga ketika status berubah atau AI menolak laporan, petugas ketika warga mengirim klarifikasi, dan warga ketika laporan diselesaikan.

**Pertanyaan:** Apakah notifikasinya realtime?

**Jawaban:**
Saat ini notifikasi disimpan di database dan frontend mengambil unread count/list lewat API. Untuk produksi, bisa ditingkatkan ke realtime dengan WebSocket atau server-sent events agar petugas langsung mendapat update tanpa refresh.

## 15. Performance dan Skalabilitas

**Pertanyaan:** Kalau laporan sudah ribuan, apakah map akan berat?

**Jawaban:**
Untuk MVP, data map masih bisa dimuat langsung dengan filter status/search. Untuk skala besar, backend sudah mendukung pagination, limit, bounding box (`minLat`, `maxLat`, `minLng`, `maxLng`), status, kategori, dinas, cabang, dan search. Peningkatan berikutnya adalah marker clustering, query berdasarkan viewport map, dan server-side aggregation.

**Pertanyaan:** Search dilakukan di frontend atau backend?

**Jawaban:**
Ada kombinasi. Untuk dashboard tertentu frontend bisa memfilter data yang sudah ada, tetapi endpoint backend juga mendukung parameter `search`. Untuk skala produksi, search utama sebaiknya server-side supaya tidak perlu memuat seluruh data ke browser.

**Pertanyaan:** Bagaimana mencegah biaya AI membengkak?

**Jawaban:**
Dengan membatasi ukuran dan jumlah gambar, menggunakan model yang cost-effective untuk validasi awal, cache hasil AI di database, tidak mengulang AI review untuk laporan yang sama, menambahkan rate limit per user/IP, dan memasang budget alert di provider AI.

**Pertanyaan:** Bagaimana scaling backend?

**Jawaban:**
Backend stateless karena session dibaca dari cookie dan data utama ada di database/object storage. Jadi backend bisa diskalakan horizontal di beberapa instance selama environment variable dan database sama. Untuk upload besar, object storage tetap menjadi tempat file, bukan disk lokal server.

## 16. Deployment

**Pertanyaan:** Bagaimana cara deploy paling sederhana?

**Jawaban:**
Frontend bisa dibuild menjadi static files dan diserve via Nginx, Vercel, Render Static Site, Netlify, atau Cloudflare Pages. Backend bisa dideploy sebagai Node.js service atau Docker container di Render, Railway, Fly.io, VPS, atau cloud provider lain. Database memakai PostgreSQL managed, object storage memakai S3-compatible bucket, dan AI memakai Gemini API.

**Pertanyaan:** Environment variable penting apa saja?

**Jawaban:**
Frontend:
- `VITE_API_URL`
- `VITE_MAPBOX_TOKEN`
- `VITE_SITE_URL`

Backend:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `SMTP_*`
- `GEMINI_API_KEY`
- `S3_ENDPOINT_URL`
- `S3_BUCKET_NAME`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BASE_URL`

**Pertanyaan:** Bagaimana monitoring dasar?

**Jawaban:**
Backend punya endpoint health check yang mengecek status service, uptime, memory, Node version, dan koneksi database. Untuk produksi, ini bisa dihubungkan ke uptime monitor dan alerting.

## 17. Budgeting dan Hosting

> Catatan: angka di bawah adalah estimasi. Pricing provider berubah, jadi sebelum presentasi final sebaiknya cek ulang link sumber. Gunakan USD agar mudah dibandingkan; kalau perlu rupiah, kalikan kurs saat presentasi.

### Paket demo/lomba

| Komponen | Opsi | Estimasi |
| --- | --- | --- |
| Frontend static hosting | Vercel Hobby / Render Static Site / Cloudflare Pages | $0 |
| Backend API | Render Free Web Service atau free tier sejenis | $0 untuk demo, bisa sleep/cold start |
| Database PostgreSQL | Supabase Free / Render Postgres Free | $0 dengan limit |
| Object storage | Tigris free tier atau S3-compatible free tier | $0 untuk data kecil |
| AI Gemini | Free tier Google AI Studio/Gemini API | $0 selama limit cukup |
| Map/Search | Mapbox free tier | $0 selama limit cukup |
| Domain | Opsional | sekitar $10-15/tahun, tergantung registrar |

**Jawaban kalau ditanya budget demo:**
Untuk lomba, sistem bisa dijalankan hampir nol rupiah menggunakan free tier: frontend static hosting, backend free tier, database free tier, object storage free tier, Gemini free tier, dan Mapbox free tier. Risiko free tier adalah cold start, limit kuota, dan tidak cocok untuk SLA produksi.

### Paket MVP produksi kecil

| Komponen | Opsi | Estimasi/bulan |
| --- | --- | --- |
| Frontend | Vercel/Render/Cloudflare static | $0-20 |
| Backend | Render Starter/Standard atau VPS kecil | $7-25 |
| Database | Supabase Pro atau managed Postgres kecil | $25+ |
| Object storage | Tigris/S3-compatible | mulai dari free, lalu usage-based |
| AI | Gemini paid tier | usage-based |
| Mapbox | Pay-as-you-go | biasanya $0 di awal jika masih dalam free tier |
| Email SMTP | Gmail app password/brevo/mail provider | $0-15 |
| Domain | Registrar | sekitar $1-2/bulan jika dihitung bulanan |

**Jawaban kalau ditanya budget MVP:**
Untuk MVP kecil, budget realistis sekitar $35-80 per bulan di luar biaya AI dan traffic tinggi. Biaya terbesar biasanya database managed, backend always-on, dan potensi AI/map usage. AI dan Mapbox sebaiknya diberi budget alert karena biayanya mengikuti jumlah request.

### Paket produksi lebih serius

| Komponen | Opsi | Estimasi/bulan |
| --- | --- | --- |
| Frontend | Vercel Pro atau CDN/static hosting berbayar | $20+ |
| Backend | Standard/Pro container service atau VPS 2 vCPU+ | $25-85+ |
| Database | Managed Postgres dengan backup | $25-100+ |
| Object storage | S3-compatible object storage | usage-based |
| AI | Gemini paid tier dengan budget cap | usage-based |
| Observability | Uptime + log monitoring | $0-50+ |
| Backup & security | DB backup, secret rotation, WAF/rate limit | tergantung provider |

**Jawaban kalau ditanya produksi pemerintah:**
Untuk produksi serius, kita tidak mengandalkan free tier. Minimal perlu backend always-on, database managed dengan backup, object storage, monitoring, rate limiting, budget alert AI, dan kebijakan backup. Arsitektur tetap sama, tapi SLA, security, observability, dan data retention harus dinaikkan.

### Biaya AI secara konsep

**Pertanyaan:** Biaya AI dihitung dari apa?

**Jawaban:**
Biaya Gemini API biasanya dihitung dari token input/output dan jenis model. Karena LaporPak memakai teks plus gambar, biaya dipengaruhi jumlah laporan, panjang deskripsi, jumlah foto, ukuran foto, dan model yang dipakai. Itulah alasan sistem membatasi maksimal 5 foto dan 5MB per foto.

**Contoh cara menjelaskan estimasi AI:**
Misalnya 1 laporan memanggil AI satu kali untuk validasi. Kalau ada 1.000 laporan per bulan, berarti sekitar 1.000 request AI per bulan. Biaya final tergantung model dan jumlah token/gambar per request. Untuk mengontrol biaya, kita bisa memakai model flash/lite, rate limit, cache hasil AI, dan budget alert.

### Sumber harga resmi

- Vercel pricing/Hobby: https://vercel.com/docs/accounts/plans/hobby
- Vercel pricing overview: https://vercel.com/docs/pricing
- Render pricing: https://render.com/pricing
- Supabase pricing: https://supabase.com/pricing
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Mapbox pricing: https://www.mapbox.com/pricing
- Tigris pricing: https://www.tigrisdata.com/docs/pricing/

## 18. Pertanyaan Jebakan dan Jawaban Aman

**Pertanyaan:** Kalau frontend menyembunyikan tombol, apakah itu cukup untuk security?

**Jawaban:**
Tidak cukup. Menyembunyikan tombol hanya UX. Security wajib di backend. Di LaporPak, endpoint sensitif tetap memakai middleware auth/role dan pengecekan hak edit laporan.

**Pertanyaan:** Kalau ada user upload file `.exe` tapi extension diganti jadi `.jpg`?

**Jawaban:**
Backend mengecek MIME type lewat Multer file filter, bukan hanya nama file. Untuk produksi bisa ditambah validasi magic bytes, image re-encoding, dan virus scanning.

**Pertanyaan:** Kalau dua petugas update laporan yang sama bersamaan?

**Jawaban:**
Saat ini update akan mengikuti request yang berhasil terakhir di database. Untuk produksi, kita bisa tambah optimistic locking dengan `updatedAt`/version, transaksi, atau assignment lock supaya tidak terjadi overwrite tanpa disadari.

**Pertanyaan:** Kalau AI salah menolak laporan valid?

**Jawaban:**
Sistem menyimpan alasan AI dan saran perbaikan. Untuk produksi, perlu jalur banding/manual review agar laporan yang ditolak AI bisa diperiksa manusia. AI membantu triage, bukan menggantikan tanggung jawab keputusan publik sepenuhnya.

**Pertanyaan:** Apakah data warga aman?

**Jawaban:**
Data akses dilindungi session dan role-based authorization. Untuk produksi, perlu tambahan kebijakan privasi, enkripsi transport HTTPS, backup terenkripsi, akses admin terbatas, audit log, dan retensi data yang jelas.

**Pertanyaan:** Kenapa tidak pakai realtime langsung?

**Jawaban:**
Untuk MVP, polling/query notifikasi sudah cukup dan lebih sederhana. Realtime bisa ditambahkan nanti ketika jumlah petugas dan kebutuhan operasional meningkat.

**Pertanyaan:** Kenapa bukan mobile app?

**Jawaban:**
Web app lebih cepat diakses warga tanpa install aplikasi, lebih cocok untuk demo dan adopsi awal. Kalau validasi produk sudah kuat, frontend bisa dikembangkan menjadi PWA atau mobile app native.

**Pertanyaan:** Apakah sistem siap dipakai satu kota?

**Jawaban:**
Fondasinya mengarah ke sana: ada role, dinas, cabang, kategori, peta, routing, notifikasi, dan admin. Namun untuk produksi satu kota, perlu hardening: load test, monitoring, backup, rate limiting, audit log, SOP review manual, dan SLA infrastruktur.

## 19. Catatan yang Perlu Dicek Sebelum Demo

- Pastikan backend dan frontend memakai `VITE_API_URL`, `CLIENT_URL`, dan `CORS_ORIGINS` yang benar.
- Pastikan `GEMINI_API_KEY`, S3 credentials, SMTP credentials, dan Mapbox token aktif.
- Pastikan seed data dinas, cabang, kategori, dan petugas sudah siap.
- Pastikan akun demo tersedia: warga, petugas dinas, dan admin.
- Pastikan upload foto kecil dan jelas supaya AI bisa membaca.
- Pastikan endpoint yang disebut saat demo benar-benar tersedia di backend. Khusus fitur "claim report", frontend sudah punya mutation ke `/reports/:id/claim`; sebelum demo besar, cek lagi apakah route backend claim sudah diaktifkan atau jelaskan sebagai pengembangan berikutnya.
- Pastikan free tier provider tidak tidur/cold start pas presentasi. Buka aplikasi beberapa menit sebelum demo.

## 20. Jawaban Penutup Kalau Juri Tanya "Apa Kelebihan Teknisnya?"

**Jawaban:**
Kelebihan teknis LaporPak ada di kombinasi map-based reporting, AI-assisted validation, routing dinas berbasis kategori dan lokasi, role-aware dashboard untuk warga/dinas/admin, timeline transparan, dan bukti resolusi berupa foto. Jadi sistem bukan hanya form pengaduan, tapi workflow operasional dari laporan masuk sampai selesai, lengkap dengan validasi, assignment, follow-up, dan monitoring.

