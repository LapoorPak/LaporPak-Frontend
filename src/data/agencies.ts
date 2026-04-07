const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1577416412292-747c6607f055?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=250&fit=crop"
];

function getRandomImages() {
  const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 images
  const shuffled = [...IMAGE_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export interface MockAgency {
  name: string;
  type: string;
  lat: number;
  lng: number;
  images: string[];
}

export const MOCK_AGENCIES: MockAgency[] = [
  { "name": "Dinas Bina Marga Provinsi DKI Jakarta", "type": "bina_marga", "lat": -6.1818, "lng": 106.8223 },
  { "name": "Dinas Sumber Daya Air Provinsi DKI Jakarta", "type": "sda", "lat": -6.1820, "lng": 106.8200 },
  { "name": "Dinas Lingkungan Hidup Provinsi DKI Jakarta", "type": "lingkungan_hidup", "lat": -6.2625, "lng": 106.8770 },
  { "name": "Dinas Perhubungan Provinsi DKI Jakarta", "type": "perhubungan", "lat": -6.1770, "lng": 106.8185 },
  { "name": "Dinas Cipta Karya, Tata Ruang dan Pertanahan DKI", "type": "cipta_karya", "lat": -6.1795, "lng": 106.8228 },
  { "name": "Suku Dinas Bina Marga Jakarta Pusat", "type": "bina_marga", "lat": -6.1764, "lng": 106.8322 },
  { "name": "Suku Dinas Lingkungan Hidup Jakarta Pusat", "type": "lingkungan_hidup", "lat": -6.1685, "lng": 106.8521 },
  { "name": "Suku Dinas Perhubungan Jakarta Pusat", "type": "perhubungan", "lat": -6.1650, "lng": 106.8390 },
  { "name": "Suku Dinas Sumber Daya Air Jakarta Pusat", "type": "sda", "lat": -6.1730, "lng": 106.8280 },
  { "name": "Suku Dinas Bina Marga Jakarta Selatan", "type": "bina_marga", "lat": -6.2415, "lng": 106.8045 },
  { "name": "Suku Dinas Lingkungan Hidup Jakarta Selatan", "type": "lingkungan_hidup", "lat": -6.2530, "lng": 106.8140 },
  { "name": "Suku Dinas Perhubungan Jakarta Selatan", "type": "perhubungan", "lat": -6.2665, "lng": 106.8055 },
  { "name": "Suku Dinas Sumber Daya Air Jakarta Selatan", "type": "sda", "lat": -6.2550, "lng": 106.8000 },
  { "name": "Suku Dinas Bina Marga Jakarta Barat", "type": "bina_marga", "lat": -6.1845, "lng": 106.7565 },
  { "name": "Suku Dinas Lingkungan Hidup Jakarta Barat", "type": "lingkungan_hidup", "lat": -6.1640, "lng": 106.7450 },
  { "name": "Suku Dinas Perhubungan Jakarta Barat", "type": "perhubungan", "lat": -6.1550, "lng": 106.7380 },
  { "name": "Suku Dinas Sumber Daya Air Jakarta Barat", "type": "sda", "lat": -6.1810, "lng": 106.7430 },
  { "name": "Suku Dinas Bina Marga Jakarta Timur", "type": "bina_marga", "lat": -6.2145, "lng": 106.8850 },
  { "name": "Suku Dinas Lingkungan Hidup Jakarta Timur", "type": "lingkungan_hidup", "lat": -6.2085, "lng": 106.8970 },
  { "name": "Suku Dinas Perhubungan Jakarta Timur", "type": "perhubungan", "lat": -6.2230, "lng": 106.9010 },
  { "name": "Suku Dinas Sumber Daya Air Jakarta Timur", "type": "sda", "lat": -6.2105, "lng": 106.8790 },
  { "name": "Suku Dinas Bina Marga Jakarta Utara", "type": "bina_marga", "lat": -6.1245, "lng": 106.8920 },
  { "name": "Suku Dinas Lingkungan Hidup Jakarta Utara", "type": "lingkungan_hidup", "lat": -6.1360, "lng": 106.8855 },
  { "name": "Suku Dinas Perhubungan Jakarta Utara", "type": "perhubungan", "lat": -6.1280, "lng": 106.9020 },
  { "name": "Suku Dinas Sumber Daya Air Jakarta Utara", "type": "sda", "lat": -6.1305, "lng": 106.8845 },
  { "name": "Dinas Pekerjaan Umum dan Penataan Ruang Kota Tangerang", "type": "pupr", "lat": -6.1705, "lng": 106.6322 },
  { "name": "Dinas Perhubungan Kota Tangerang", "type": "perhubungan", "lat": -6.1850, "lng": 106.6430 },
  { "name": "Dinas Lingkungan Hidup Kota Tangerang", "type": "lingkungan_hidup", "lat": -6.1520, "lng": 106.6210 },
  { "name": "Dinas Perumahan dan Permukiman Kota Tangerang", "type": "perumahan", "lat": -6.1680, "lng": 106.6300 },
  { "name": "Satuan Polisi Pamong Praja Kota Tangerang", "type": "satpol_pp", "lat": -6.1720, "lng": 106.6315 },
  { "name": "BPBD Kota Tangerang", "type": "bpbd", "lat": -6.1770, "lng": 106.6340 },
  { "name": "Dinas Pekerjaan Umum Kota Tangerang Selatan", "type": "pupr", "lat": -6.2895, "lng": 106.7160 },
  { "name": "Dinas Bina Marga dan SDA Tangerang Selatan", "type": "bina_marga", "lat": -6.2910, "lng": 106.7155 },
  { "name": "Dinas Perhubungan Tangerang Selatan", "type": "perhubungan", "lat": -6.2870, "lng": 106.7180 },
  { "name": "Dinas Lingkungan Hidup Tangerang Selatan", "type": "lingkungan_hidup", "lat": -6.2850, "lng": 106.7195 },
  { "name": "Satpol PP Tangerang Selatan", "type": "satpol_pp", "lat": -6.2900, "lng": 106.7150 },
  { "name": "BPBD Tangerang Selatan", "type": "bpbd", "lat": -6.2880, "lng": 106.7200 },
  { "name": "Dinas Pekerjaan Umum Kab. Tangerang", "type": "pupr", "lat": -6.2250, "lng": 106.4710 },
  { "name": "Dinas Bina Marga dan SDA Kab. Tangerang", "type": "bina_marga", "lat": -6.2260, "lng": 106.4705 },
  { "name": "Dinas Perhubungan Kab. Tangerang", "type": "perhubungan", "lat": -6.2230, "lng": 106.4720 },
  { "name": "Dinas Kebersihan dan Pertamanan Kab. Tangerang", "type": "lingkungan_hidup", "lat": -6.2245, "lng": 106.4690 },
  { "name": "Satpol PP Kabupaten Tangerang", "type": "satpol_pp", "lat": -6.2270, "lng": 106.4730 },
  { "name": "Dinas Penanaman Modal & Pelayanan Terpadu Satu Pintu Jakarta", "type": "ptsp", "lat": -6.1830, "lng": 106.8290 },
  { "name": "Dinas Pemadam Kebakaran DKI Jakarta", "type": "pemadam_kebakaran", "lat": -6.1710, "lng": 106.8120 },
  { "name": "UPT TransJakarta - Dinas Perhubungan", "type": "perhubungan", "lat": -6.2440, "lng": 106.8775 },
  { "name": "UPT Suku Dinas Kebersihan Jaktim", "type": "lingkungan_hidup", "lat": -6.2180, "lng": 106.9120 },
  { "name": "UPT Suku Dinas Bina Marga Blok M", "type": "bina_marga", "lat": -6.2445, "lng": 106.8001 },
  { "name": "Pusat Kendali Lalu Lintas DKI Jakarta", "type": "perhubungan", "lat": -6.1775, "lng": 106.8190 },
  { "name": "Balai Besar Wilayah Sungai Ciliwung Cisadane", "type": "sda", "lat": -6.2420, "lng": 106.8660 },
  { "name": "Dinas Kesehatan Provinsi DKI Jakarta", "type": "kesehatan", "lat": -6.1760, "lng": 106.8250 }
].map(agency => ({ ...agency, images: getRandomImages() }));
