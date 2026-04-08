import { Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Map Grid Pattern & Giant Watermark */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none stroke-gray-900" 
           style={{ 
             backgroundImage: "radial-gradient(#111827 1px, transparent 1px)", 
             backgroundSize: "40px 40px" 
           }}>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none opacity-[0.02]">
        <h1 className="text-[30vw] font-black tracking-tighter text-[#111827] leading-none">404</h1>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        

        {/* Text Content */}
        <div className="text-center max-w-lg mx-auto mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-6 tracking-tight leading-tight"
          >
            Ups, Halaman Ini Hilang dari Peta
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="text-lg text-gray-500 leading-relaxed font-medium"
          >
            Tautan yang Anda buka mungkin salah atau halaman sudah dipindahkan. 
            Mari kembali ke jalur yang benar.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 px-8 bg-[#C01D33] hover:bg-[#A0182A] text-white rounded-full font-bold text-lg inline-flex items-center gap-3 shadow-lg shadow-red-500/25 transition-all hover:-translate-y-1">
              Kembali ke Beranda
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
