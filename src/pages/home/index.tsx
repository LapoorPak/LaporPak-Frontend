import { Link } from "react-router";
import { motion } from "framer-motion";
import { Lightbulb, Megaphone } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans relative">
      <div className="absolute top-[15%] left-[-10%] w-[500px] h-[500px] bg-red-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 -z-10 pointer-events-none" />
      <div className="absolute top-[45%] right-[-10%] w-[600px] h-[600px] bg-red-50 rounded-full mix-blend-multiply filter blur-[100px] opacity-80 -z-10 pointer-events-none" />
      <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] bg-pink-50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 -z-10 pointer-events-none" />

      <Navbar />

      {/* Prelude Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 min-h-[calc(100vh-90px)] flex flex-col justify-center items-center pb-6 md:pb-20 pt-2 lg:pt-0">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-20 w-full mt-2 md:mt-0">
           
           <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1 pt-2 lg:pt-0">
             <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
               <h2 className="text-[5.5rem] lg:text-[8rem] leading-[0.85] font-heading font-black text-[#db2744] tracking-tighter mb-2 md:mb-4">
                   70<span className="text-5xl lg:text-6xl">%</span>
               </h2>
               <h3 className="text-3xl md:text-5xl font-heading font-extrabold text-gray-900 tracking-tight leading-tight mb-4 md:mb-6">
                 Fasilitas Publik <br/> Terbengkalai <span className="text-[#db2744]">Tanpa Laporan.</span>
               </h3>
               <p className="text-gray-500 font-medium md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                 Infrastruktur rusak dan lingkungan tak terurus di sekitar kita. Berhenti menunggu. <span className="text-[#db2744] font-bold">LaporPak</span> hadir sebagai wadah Anda untuk menagih hak perbaikan kepada otoritas berwenang sekarang juga.
               </p>
             </motion.div>
           </div>
           
           <div className="w-full lg:w-1/2 flex justify-center items-center shrink-0 order-1 lg:order-2">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration:0.6, delay:0.2}} className="relative w-full max-w-[260px] sm:max-w-[350px] md:max-w-[500px]">
                <img src="/illustrations/illustration_70_percent.png" className="w-full h-auto object-contain mix-blend-multiply" alt="Fasilitas Publik Terbengkalai" />
             </motion.div>
           </div>
           
        </div>
        
        
        <motion.div 
          animate={{y: [0, 10, 0]}} 
          transition={{repeat: Infinity, duration: 2}}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden md:flex"
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </div>
        </motion.div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mt-8">
        <div className="bg-gradient-to-tr from-[#db2744] via-[#cd1e38] to-[#ab1228] rounded-[2.5rem] px-6 pt-12 pb-48 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-visible shadow-xl mt-12 mb-32 md:mb-20">
          
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-200/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-overlay" />

          <div className="w-full md:w-[45%] z-10 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0 relative py-2">
             <div className="mb-2">
                <Megaphone size={72} className="text-white drop-shadow-md -rotate-[12deg] opacity-100" strokeWidth={1.5} fill="white" />
             </div>
             <h1 className="text-[3rem] md:text-5xl lg:text-[4.5rem] leading-[0.95] font-heading font-black text-white tracking-widest uppercase mb-4 drop-shadow-md">
                LAPORPAK
             </h1>
             <p className="text-white text-base md:text-xl  tracking-wide mb-2 md:mb-6 drop-shadow-sm opacity-95 leading-relaxed max-w-sm px-2 md:px-0">
               Sampaikan masalah infrastruktur dan lingkungan dengan mudah. Transparan, terpadu, dan otomatis diteruskan ke dinas terkait.
             </p>

             <div className="block md:hidden pb-4 mt-6">
               <span className="text-white font-bold text-xl tracking-wide drop-shadow-md">#BersamaMembangunKota</span>
             </div>
          </div>

          <div className="w-full md:w-[55%] relative z-10 flex flex-col items-center justify-center min-h-[100px] md:min-h-[350px] md:mt-0">
             
             <div className="hidden md:flex absolute top-[-30px] right-0 w-full justify-end">
                <span className="text-white font-bold text-2xl lg:text-3xl tracking-wide drop-shadow-md">#BersamaMembangunKota</span>
             </div>

             <div className="absolute top-10 md:relative md:top-auto w-full max-w-[320px] h-[300px] flex justify-center items-center mt-[-60px] md:mt-12 mb-[-120px] md:mb-8 scale-[0.80] sm:scale-100">
                
                <motion.div 
                  initial={{ rotate: -15, x: 20, y: 10, opacity: 0 }}
                  whileInView={{ rotate: -12, x: -90, y: 15, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "backOut" }}
                  className="absolute bg-white p-6 rounded-3xl shadow-xl w-[210px] aspect-[3/4] flex flex-col justify-start text-center transform origin-bottom border border-gray-100/50 hover:z-30 hover:scale-105 hover:rotate-[-8deg] focus:z-30 focus:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer outline-none select-none"
                  tabIndex={0}
                >
                   <div className="w-full flex justify-center mb-4 mt-1">
                     <div className="w-[140px] h-[85px] flex items-center justify-center">
                        <img src="/illustrations/card_angkat_isu.png" alt="Angkat Isu" className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                   </div>
                   <h4 className="text-[#db2744] font-extrabold text-lg mb-3">Angkat Isu</h4>
                   <p className="text-[12px] text-gray-700 leading-relaxed font-semibold">Fotokan masalah fasilitas publik secara transparan.</p>
                </motion.div>

                <motion.div 
                  initial={{ rotate: 15, x: -20, y: 10, opacity: 0 }}
                  whileInView={{ rotate: 12, x: 90, y: 15, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
                  className="absolute bg-white p-6 rounded-3xl shadow-xl w-[210px] aspect-[3/4] flex flex-col justify-start text-center transform origin-bottom border border-gray-100/50 hover:z-30 hover:scale-105 hover:rotate-[8deg] focus:z-30 focus:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer outline-none select-none"
                  tabIndex={0}
                >
                   <div className="w-full flex justify-center mb-4 mt-1">
                     <div className="w-[140px] h-[85px] flex items-center justify-center">
                        <img src="/illustrations/card_bantuan.png" alt="Bantuan" className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                   </div>
                   <h4 className="text-[#db2744] font-extrabold text-lg mb-3">Bantuan</h4>
                   <p className="text-[12px] text-gray-700 leading-relaxed font-semibold">Lacak riwayat penyelesaian masalah yang dilaporkan.</p>
                </motion.div>
                
                <motion.div 
                  initial={{ rotate: 0, y: 20, opacity: 0 }}
                  whileInView={{ rotate: 0, y: -10, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "backOut" }}
                  className="absolute bg-white p-6 rounded-3xl shadow-2xl w-[220px] aspect-[3/4] flex flex-col justify-start text-center z-20 border border-gray-100 hover:scale-105 hover:z-40 focus:scale-105 focus:z-40 active:scale-95 transition-transform duration-300 cursor-pointer outline-none select-none"
                  tabIndex={0}
                >
                   <div className="w-full flex justify-center mb-4 mt-1">
                     <div className="w-[140px] h-[85px] flex items-center justify-center">
                        <img src="/illustrations/card_cari_tau.png" alt="Cari Tau" className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                   </div>
                   <h4 className="text-[#db2744] font-extrabold text-lg mb-3">Cari Tau</h4>
                   <p className="text-[12px] text-gray-700 leading-relaxed font-semibold">Sistem meneruskan aduan langsung ke dinas berwenang.</p>
                </motion.div>

             </div>
          </div>
          
          
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      <section className="pt-32 pb-8 relative z-10 px-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-7xl mx-auto"
        >
          <div className="flex flex-col items-center text-center gap-1 md:gap-2">
             <h2 className="text-3xl md:text-[2.5rem] leading-tight font-heading font-black text-gray-900 tracking-tight">
                <span className="text-[#db2744]">LaporPak</span> menghadirkan
             </h2>
             <h2 className="text-3xl md:text-[2.5rem] leading-tight font-heading font-bold text-[#db2744] tracking-tight">
                3 kemudahan
             </h2>
          </div>
          <div className="flex items-center relative mt-6 md:mt-0 md:ml-4">
             <div className="relative -mr-6 rotate-[-15deg] z-10">
               <Lightbulb size={96} className="text-yellow-400 " strokeWidth={1.5} fill="#facc15" />
             </div>
             <div className="relative rotate-[5deg] z-20">
               <Lightbulb size={112} className="text-yellow-400 " strokeWidth={1.5} fill="#facc15" />
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 space-y-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="py-10 flex flex-col md:flex-row items-center gap-8 md:gap-20 transition-all duration-300"
        >
          <div className="md:w-1/2 space-y-3 md:space-y-4 text-center md:text-left order-2 md:order-1">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#db2744] tracking-tight">Sampaikan Keluhan</h3>
            <p className="text-lg md:text-xl text-gray-700 leading-[1.4] ">
              Fotokan jalan berlubang, tumpukan sampah, atau fasilitas publik yang rusak. 
              Sistem akan otomatis mendeteksi lokasi koordinat Anda.
            </p>
            <Link to="/register" className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors shadow-sm text-lg mt-2">
              Mulai lapor yuk!
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center order-1 md:order-2">
            <img 
              src="/illustrations/hero.png" 
              alt="Ilustrasi Melapor" 
              className="w-full max-w-[360px] md:max-w-[420px]" 
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="py-10 flex flex-col md:flex-row-reverse items-center gap-8 md:gap-20 transition-all duration-300"
        >
          <div className="md:w-1/2 space-y-3 md:space-y-4 text-center md:text-left order-2 md:order-1">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#db2744] tracking-tight">Otomatis Tepat Sasaran</h3>
            <p className="text-lg md:text-xl text-gray-700 leading-[1.4] ">
              Tidak perlu bingung mencari instansi yang berwenang. Teknologi kami akan memproses
              dan meneruskan laporan Anda ke dinas terkait secara otomatis.
            </p>
            <div className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors cursor-pointer shadow-sm text-lg mt-2">
              Lihat cara kerja!
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center order-1 md:order-2">
             <img 
               src="/illustrations/ai-feature.png" 
               alt="Ilustrasi Proses" 
               className="w-full max-w-[360px] md:max-w-[420px]" 
               loading="lazy"
             />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="py-10 flex flex-col md:flex-row items-center gap-8 md:gap-20 transition-all duration-300"
        >
          <div className="md:w-1/2 space-y-3 md:space-y-4 text-center md:text-left order-2 md:order-1">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#db2744] tracking-tight">Pantau Status Laporan</h3>
            <p className="text-lg md:text-xl text-gray-700 leading-[1.4]">
              Ketahui perkembangan laporan Anda secara real-time. Kami menjamin transparansi 
              tindak lanjut dari awal hingga masalah tuntas.
            </p>
            <Link to="/register" className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors shadow-sm text-lg mt-2">
              Pantau sekarang!
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center order-1 md:order-2">
             <img 
               src="/illustrations/community.png" 
               alt="Ilustrasi Pantau" 
               className="w-full max-w-[360px] md:max-w-[420px]" 
               loading="lazy"
             />
          </div>
        </motion.div>

      </section>

      <Footer />
    </div>
  );
}
