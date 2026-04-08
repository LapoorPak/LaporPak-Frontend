import { Link } from "react-router";
import { motion } from "framer-motion";
import { Lightbulb, Megaphone } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { useAuth } from "@/hooks";

const IDEA_SPARKS = [
  { id: "spark-1", className: "left-3 top-5 h-2.5 w-2.5 bg-yellow-300", delay: 0.1, duration: 2.8, x: -6 },
  { id: "spark-2", className: "left-10 top-1 h-3.5 w-3.5 bg-amber-300", delay: 0.5, duration: 3.1, x: 8 },
  { id: "spark-3", className: "right-6 top-4 h-2.5 w-2.5 bg-yellow-200", delay: 0.2, duration: 2.6, x: 6 },
  { id: "spark-4", className: "right-0 top-11 h-3 w-3 bg-amber-200", delay: 0.8, duration: 3.3, x: -10 },
  { id: "spark-5", className: "left-14 bottom-6 h-2 w-2 bg-yellow-300", delay: 0.4, duration: 2.9, x: 12 },
  { id: "spark-6", className: "right-12 bottom-3 h-2.5 w-2.5 bg-amber-300", delay: 0.9, duration: 2.7, x: -8 },
] as const;

const IDEA_RAYS = [
  { id: "ray-1", className: "left-9 top-12 w-10 rotate-[-18deg]", delay: 0.1 },
  { id: "ray-2", className: "left-0 top-20 w-12 rotate-[-8deg]", delay: 0.35 },
  { id: "ray-3", className: "right-4 top-10 w-12 rotate-[16deg]", delay: 0.55 },
  { id: "ray-4", className: "right-0 top-20 w-10 rotate-[8deg]", delay: 0.8 },
] as const;

export default function Home() {
  const { data: session } = useAuth();
  const dashboardPath = "/dashboard";
  const primaryCtaPath = session ? dashboardPath : "/register";
  const primaryCtaLabel = session ? "Buka dashboard" : "Mulai lapor yuk!";
  const secondaryCtaPath = session ? dashboardPath : "/register";
  const secondaryCtaLabel = session ? "Pantau di dashboard" : "Pantau sekarang!";

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
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative mt-6 md:mt-0 md:ml-4 flex h-[150px] w-[210px] items-center justify-center"
          >
            <motion.div
              className="absolute left-5 top-8 h-20 w-20 rounded-full bg-yellow-300/40 blur-3xl"
              animate={{ scale: [0.92, 1.12, 0.95], opacity: [0.35, 0.75, 0.45] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-4 top-2 h-24 w-24 rounded-full bg-amber-300/45 blur-3xl"
              animate={{ scale: [0.9, 1.08, 0.94], opacity: [0.3, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut", delay: 0.35 }}
            />

            {IDEA_RAYS.map((ray) => (
              <motion.span
                key={ray.id}
                className={`absolute h-1.5 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 shadow-[0_0_18px_rgba(250,204,21,0.45)] ${ray.className}`}
                animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.8, 1.08, 0.84] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: ray.delay, ease: "easeInOut" }}
              />
            ))}

            {IDEA_SPARKS.map((spark) => (
              <motion.span
                key={spark.id}
                className={`absolute rounded-full shadow-[0_0_14px_rgba(250,204,21,0.5)] ${spark.className}`}
                animate={{
                  y: [0, -12, 0],
                  x: [0, spark.x, 0],
                  opacity: [0.2, 1, 0.25],
                  scale: [0.9, 1.2, 0.95],
                }}
                transition={{
                  repeat: Infinity,
                  duration: spark.duration,
                  delay: spark.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            <motion.div
              animate={{ y: [0, -7, 0], rotate: [-15, -12, -15], scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 3.1, ease: "easeInOut" }}
              className="relative -mr-6 z-10"
            >
              <div className="absolute inset-2 rounded-full bg-yellow-200/50 blur-2xl" />
              <Lightbulb size={96} className="relative text-yellow-400 drop-shadow-[0_8px_16px_rgba(250,204,21,0.3)]" strokeWidth={1.5} fill="#facc15" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0], rotate: [5, 8, 5], scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.25 }}
              className="relative z-20"
            >
              <div className="absolute inset-2 rounded-full bg-amber-200/50 blur-2xl" />
              <Lightbulb size={112} className="relative text-yellow-400 drop-shadow-[0_12px_22px_rgba(250,204,21,0.36)]" strokeWidth={1.5} fill="#facc15" />
            </motion.div>
          </motion.div>
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
            <Link to={primaryCtaPath} className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors shadow-sm text-lg mt-2">
              {primaryCtaLabel}
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
            <Link to="/cara-kerja" className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors cursor-pointer shadow-sm text-lg mt-2">
              Lihat cara kerja!
            </Link>
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
            <Link to={secondaryCtaPath} className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors shadow-sm text-lg mt-2">
              {secondaryCtaLabel}
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
