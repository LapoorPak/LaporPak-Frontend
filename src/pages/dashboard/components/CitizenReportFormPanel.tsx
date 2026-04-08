import type { ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, MapPin, Navigation, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CitizenReportFormPanelProps {
  isOpen: boolean;
  isDesktop: boolean;
  title: string;
  description: string;
  photoPreviews: string[];
  selectedLocation: [number, number];
  userLocation: [number, number] | null;
  isSubmitting: boolean;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onEditLocation: () => void;
  onUseGpsLocation: () => void;
  onSubmit: () => void;
}

export function CitizenReportFormPanel({
  isOpen,
  isDesktop,
  title,
  description,
  photoPreviews,
  selectedLocation,
  userLocation,
  isSubmitting,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onPhotoUpload,
  onRemovePhoto,
  onEditLocation,
  onUseGpsLocation,
  onSubmit,
}: CitizenReportFormPanelProps) {
  const canUseGpsLocation =
    !!userLocation &&
    (selectedLocation[0] !== userLocation[0] || selectedLocation[1] !== userLocation[1]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`absolute z-30 pointer-events-none ${isDesktop ? "top-24 right-6" : "bottom-0 left-0 w-full"}`}
        >
          <motion.div
            drag={isDesktop}
            dragMomentum={false}
            className={`bg-white flex flex-col overflow-hidden resize pointer-events-auto ${
              isDesktop
                ? "h-[calc(100vh-120px)] min-h-[400px] w-[400px] min-w-[320px] max-w-[600px] shadow-2xl rounded-xl border border-gray-100"
                : "w-full rounded-t-3xl h-[85vh] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
            }`}
          >
            <div className="px-7 py-6 flex justify-between items-center bg-white pb-2 relative z-10 cursor-move active:cursor-grabbing">
              <div>
                <h3 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                  Laporan Baru
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">Isi detail lengkap</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 space-y-7 bg-white pb-6 pt-2 hide-scrollbar">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-black text-gray-300 tracking-widest leading-none">
                  JUDUL LAPORAN
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  placeholder="Contoh: Lampu lalu lintas mati"
                  className="rounded-sm h-14 bg-white border border-gray-200 focus:bg-gray-50 focus:border-[#db2744] focus:ring-0 transition-all font-bold text-gray-900 text-sm shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-black text-gray-300 tracking-widest leading-none">
                  DETAIL KRONOLOGI
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder="Ceritakan urutan dan kondisi yang terjadi..."
                  className="rounded-sm min-h-[120px] bg-white border border-gray-200 focus:bg-gray-50 focus:border-[#db2744] focus:ring-0 transition-all font-bold text-gray-900 text-sm resize-none p-5 shadow-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-300 tracking-widest leading-none">
                  UNGGAH BUKTI FOTO
                </Label>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {photoPreviews.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative w-full h-[100px] rounded-sm overflow-hidden group">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => onRemovePhoto(index)}
                            className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="w-full h-[100px] rounded-sm border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-400 transition-all relative cursor-pointer group">
                  <ImagePlus size={24} className="mb-2 text-gray-300 group-hover:text-gray-400 transition-colors" />
                  <span className="text-[11px] font-bold font-sans uppercase tracking-widest">Pilih Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-300 tracking-widest leading-none">LOKASI TERPILIH</Label>
                <div className="flex items-center justify-between p-1.5 border border-transparent">
                  <div className="flex items-center gap-3">
                    <div className="text-[#db2744]">
                      <MapPin size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Otomatis tersinkronisasi.
                      <br />
                      <span className="text-gray-900 font-mono font-bold mt-0.5 block text-xs">
                        {selectedLocation[1].toFixed(5)}, {selectedLocation[0].toFixed(5)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onEditLocation}
                    className="text-[10px] font-bold uppercase text-[#db2744] hover:text-rose-600 transition-colors"
                  >
                    Ubah
                  </button>
                </div>

                {canUseGpsLocation && (
                  <button
                    onClick={onUseGpsLocation}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100/80 text-[#db2744] text-[11px] font-black tracking-widest uppercase transition-colors shadow-sm"
                  >
                    <Navigation size={15} strokeWidth={2.5} />
                    Gunakan Lokasi GPS Saya
                  </button>
                )}
              </div>
            </div>

            <div className="px-7 py-5 bg-white border-t border-gray-100">
              <Button
                onClick={onSubmit}
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="w-full bg-[#db2744] hover:bg-[#b01e33] disabled:opacity-50 rounded-sm h-12 text-white font-black tracking-widest text-sm active:scale-[0.98] transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "KIRIM LAPORAN"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
