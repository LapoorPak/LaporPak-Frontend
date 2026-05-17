import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { getDashboardPathForRole, getLoginPathForRole } from "@/lib/auth-portal";

const faqs = [
  {
    q: "Apakah laporan saya aman dan anonim?",
    a: "Sistem pemerintahan kami memastikan identitas Anda terlindungi. Fokus utama kami adalah menyelesaikan laporan, bukan mengekspos pelapor."
  },
  {
    q: "Bagaimana cara memantau status aduan?",
    a: "Anda dapat melihat status secara log melalui dashboard portal Anda (Baru, Dipilih, Selesai) untuk transparansi penuh dari instansi pemerintah."
  },
  {
    q: "Berapa lama laporan ditindaklanjuti?",
    a: "Kecepatan penanganan sepenuhnya berpusat pada urgensi. Target standar penyelesaian adalah 3-5 hari kerja namun beberapa instansi memproses pada hari yang sama."
  }
];

export default function HowItWorks() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { data: session } = useAuth();
  const targetUrl = session
    ? getDashboardPathForRole(session?.user?.role)
    : getLoginPathForRole();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[calc(100dvh-64px)] min-h-[520px] overflow-hidden bg-white sm:h-[calc(100dvh-80px)] sm:min-h-[620px] lg:h-[calc(100dvh-88px)]">
        <motion.img
          src="/images/cara_kerja.png"
          alt="Halte dan bus Transjakarta"
          initial={{ opacity: 0, scale: 1.03, x: -24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-0 left-1/2 h-[54vh] min-h-[315px] max-w-none -translate-x-[49%] object-contain object-bottom sm:left-0 sm:h-[88vh] sm:min-h-[520px] sm:translate-x-0 sm:object-left-bottom md:h-[104vh] lg:-left-4 lg:h-[118vh] lg:max-h-[940px]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-white/75 to-white" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-white via-white/85 to-transparent" />

        <div className="absolute left-5 right-5 top-[10vh] z-10 text-right sm:left-auto sm:right-10 sm:top-auto sm:bottom-[13vh] sm:w-[min(78vw,540px)] md:bottom-[16vh] md:right-14 lg:right-20 xl:right-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="py-4"
          >
            <h1 className="text-[2rem] font-black leading-[1.03] tracking-tight text-gray-950 min-[390px]:text-[2.2rem] sm:text-[2.65rem] md:text-[3rem] lg:text-[3.35rem] xl:text-[3.65rem]">
              Jangan Diam.
              <span className="block text-[#db2744]">Laporkan Kerusakan.</span>
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600 min-[390px]:text-base sm:text-lg md:text-xl">
              Lihat bagaimana laporanmu ditindaklanjuti.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-32 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#db0000] tracking-tight">Cara Kerjanya Sederhana</h2>
            <p className="mt-6 text-xl text-[#555555]">Hanya 3 langkah dari laporan hingga penanganan.</p>
          </div>

          <div className="space-y-16 lg:space-y-32 relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"></div>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 relative">
              <div className="lg:w-1/2 flex justify-center lg:justify-end">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] p-8 flex items-center justify-center relative">
                   <img src="/images/step1_flat.png" alt="Lapor" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="inline-flex w-16 h-16 rounded-full bg-[#C01D33]/10 items-center justify-center text-[#C01D33] font-bold text-2xl mb-6">1</div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-6">Lapor & Lampirkan</h3>
                <p className="text-lg text-[#6B7280] leading-relaxed max-w-md">Tidak perlu ribet mengetik alamat. Buka LaporPak, jepret foto langsung dari HP Anda, dan sertakan deskripsi singkat. Lokasi secara otomatis tercatat akurat melalui GPS.</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-12 lg:gap-24 relative">
              <div className="lg:w-1/2 flex justify-center lg:justify-start">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] p-8 flex items-center justify-center relative">
                   <img src="/images/step2_flat.png" alt="Sistem Mengarahkan" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
              <div className="lg:w-1/2 lg:text-right flex flex-col lg:items-end">
                <div className="inline-flex w-16 h-16 rounded-full bg-gray-100 items-center justify-center text-gray-500 font-bold text-2xl mb-6">2</div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-6">Sistem Mengarahkan</h3>
                <p className="text-lg text-[#6B7280] leading-relaxed max-w-md">Tidak perlu pusing mencari tahu dinas mana yang harus dituju. Sistem pusat kami akan memilah dan meneruskan laporan langsung ke layar portal dinas terkait secara cerdas.</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 relative">
              <div className="lg:w-1/2 flex justify-center lg:justify-end">
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] p-8 flex items-center justify-center relative">
                   <img src="/images/step3_flat.png" alt="Dinas Menangani" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="inline-flex w-16 h-16 rounded-full bg-emerald-50 items-center justify-center text-emerald-600 font-bold text-2xl mb-6">3</div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-6">Dinas Tuntaskan</h3>
                <p className="text-lg text-[#6B7280] leading-relaxed max-w-md">Petugas di lapangan menerima tiket tugas dan langsung membereskan masalah. Status perbaikannya terbuka secara publik untuk terus dilacak.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight mb-6">Pertanyaan Umum</h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">Masih kurang yakin? Temukan jawaban untuk pertanyaan ini.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-8 py-8 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="text-xl font-bold text-[#111827] pr-8">{faq.q}</span>
                  <div className="text-[#6B7280] shrink-0">
                    {activeFaq === idx ? <Minus size={24} /> : <Plus size={24} />}
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 pt-0">
                         <div className="h-px w-full bg-gray-100 mb-6"></div>
                         <p className="text-[#6B7280] text-lg leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#F9FAFB] border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="bg-[#C01D33] rounded-[40px] flex flex-col lg:flex-row items-stretch overflow-hidden relative">
              <div className="flex-1 p-12 md:p-20 flex flex-col justify-center z-10 relative">
                 <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                   Mari Kita Mulai.
                 </h2>
                 <p className="text-rose-100 text-xl font-medium mb-12 max-w-md leading-relaxed">
                   Bantu laporkan keluhan di sekitarmu dan jadilah bagian dari perubahan tata kota.
                 </p>
                 <div>
                   <Link to={targetUrl}>
                     <Button className="h-16 px-10 bg-white text-[#C01D33] hover:bg-gray-50 rounded-full font-bold text-lg hover:-translate-y-1 transition-all shadow-xl inline-flex items-center">
                       Buat Laporan <ChevronRight className="ml-2 w-5 h-5" />
                     </Button>
                   </Link>
                 </div>
              </div>

              <div className="flex-1 min-h-[300px] lg:min-h-full bg-white relative">
                 <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-[#C01D33] rounded-br-[100px] z-10"></div>
                 
                 <img 
                   src="/images/cta_illustration.png" 
                   alt="Warga Berkolaborasi" 
                   className="w-full h-full object-cover object-center relative z-0"
                 />
              </div>

           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
