import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#C01D33]/20 selection:text-[#C01D33]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-4 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-100/60 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4"></div>

        {/* Hero */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-center lg:justify-between gap-12 lg:gap-24 min-h-[calc(100vh-5rem)] mb-24 py-12 md:py-0">
           <div className="w-full md:flex-1 flex justify-center md:justify-start">
              <img 
                src="/images/help_swara.png" 
                alt="Hubungi Kami" 
                className="w-full max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] object-contain mix-blend-multiply " 
              />
           </div>

           <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#C01D33] mb-6 tracking-tight">Hubungi Kami</h1>
              <p className="text-lg lg:text-xl xl:text-2xl text-[#374151] leading-relaxed">
                Jika Anda memiliki pertanyaan, membutuhkan bantuan teknis, 
                atau ingin berdiskusi lebih lanjut, jangan ragu untuk menghubungi kami. Tim kami selalu siap melayani keluhan Anda.
              </p>
           </div>
        </section>

        {/* Form & Info */}
        <section className="flex flex-col lg:flex-row gap-12 items-start">
           <div className="flex-[2] w-full bg-white p-8 md:p-12 rounded-[32px] border border-gray-200 shadow-sm">
             <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#111827]">Nama Lengkap</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan nama lengkap Anda" 
                      className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#C01D33] focus:ring-1 focus:ring-[#C01D33] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#111827]">Alamat Email</label>
                    <input 
                      type="email" 
                      placeholder="Masukkan Email Anda" 
                      className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#C01D33] focus:ring-1 focus:ring-[#C01D33] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-[#111827]">Subjek Pesan</label>
                   <input 
                     type="text" 
                     placeholder="Masukkan subjek pesan" 
                     className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#C01D33] focus:ring-1 focus:ring-[#C01D33] transition-all"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-[#111827]">Tulis Pesan</label>
                   <textarea 
                     rows={5}
                     placeholder="Tuliskan pesan atau keluhan Anda di sini..." 
                     className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#C01D33] focus:ring-1 focus:ring-[#C01D33] transition-all resize-none"
                   ></textarea>
                </div>

                <Button className="w-full md:w-auto px-10 h-14 bg-[#C01D33] hover:bg-[#A0182A] text-white rounded-full font-bold text-lg inline-flex items-center gap-2">
                  <Send size={18} /> Kirim Pesan
                </Button>
             </form>
           </div>

           <div className="flex-1 w-full">
              <h2 className="text-xl font-extrabold text-[#C01D33] mb-6 text-center lg:text-left">Layanan Pelanggan</h2>
              <div className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                 <div className="w-14 h-14 bg-[#C01D33] shrink-0 rounded-full flex items-center justify-center text-white">
                    <Mail size={24} />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm text-gray-500 font-medium mb-1">Email Support</p>
                    <a href="mailto:support@laporpak.go.id" className="text-lg font-bold text-[#111827] truncate hover:text-[#C01D33] transition-colors">
                      support@laporpak.go.id
                    </a>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
