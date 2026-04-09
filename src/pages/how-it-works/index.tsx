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
      <section className="relative px-6 overflow-hidden min-h-[100dvh] lg:h-screen flex flex-col justify-start pt-8 md:justify-center md:pt-0 pb-12 lg:pb-0">
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-red-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-20 pointer-events-none"></div>

        <div className="text-center z-10 w-full lg:absolute lg:top-28 mb-8 lg:mb-0 shrink-0">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#C01D33] tracking-tight">Cara Kerja</h1>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center relative z-10">
          <div className="flex flex-col items-start lg:pl-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-5xl md:text-[72px] font-extrabold text-[#111827] leading-[1.1] tracking-tight mb-2 md:mb-4">
                Jangan Biarkan<br className="hidden md:block"/> Fasilitas Rusak
              </h2>
              <div className="inline-block bg-[#C01D33] text-white text-4xl md:text-[56px] font-extrabold px-8 py-3 rounded-2xl md:rounded-[24px] mt-2 mb-12 shadow-[0_10px_30px_rgba(192,29,51,0.25)]">
                Dibiarkan!
              </div>
            </motion.div>
            
            <motion.div
               initial={{ opacity: 0, pathLength: 0 }}
               animate={{ opacity: 1, pathLength: 1 }}
               transition={{ duration: 1, delay: 0.5 }}
               className="ml-24 hidden lg:block"
            >
              <svg width="220" height="130" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C01D33]">
                <path d="M10 10 C 60 120, 150 100, 180 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="transparent" strokeDasharray="300" strokeDashoffset="0"/>
                <path d="M165 60 L 185 78 L 155 95" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
              </svg>
            </motion.div>
          </div>

          <div className="relative flex justify-center lg:justify-end items-center lg:items-end w-full h-[400px] md:h-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg z-10"
            >
              <img src="/images/hero.png" alt="Ilustrasi LaporPak" className="w-full h-auto object-contain mix-blend-multiply" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-32 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight">Alurnya Sangat Mudah.</h2>
            <p className="mt-4 text-xl text-[#6B7280]">Tiga tahapan sederhana sebelum ruas jalan teratasi.</p>
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
