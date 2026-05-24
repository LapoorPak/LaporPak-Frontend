import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Images, ImagePlus, Loader2, MapPin, Navigation, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, RequiredMark } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMobileSheetResize } from "@/hooks/common";
import type { CitizenReportFormPanelProps } from "@/types/dashboard";

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
  onPhotoClick,
  onEditLocation,
  onUseGpsLocation,
  onSubmit,
}: CitizenReportFormPanelProps) {
  const {
    height: mobileSheetHeight,
    resizeMovedRef: mobileResizeMovedRef,
    setHeight: setMobileSheetHeight,
    startResize: startMobileResize,
  } = useMobileSheetResize({
    enabled: !isDesktop,
    maxHeight: 82,
    minHeight: 48,
    resetWhen: isOpen && !isDesktop,
  });
  const canUseGpsLocation =
    !!userLocation &&
    (selectedLocation[0] !== userLocation[0] || selectedLocation[1] !== userLocation[1]);

  // Refs untuk hidden inputs di mobile
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
            animate={
              isDesktop
                ? undefined
                : { height: `${mobileSheetHeight}vh` }
            }
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className={`bg-white flex flex-col overflow-hidden pointer-events-auto ${
              isDesktop
                ? "resize h-[calc(100vh-120px)] min-h-[400px] w-[400px] min-w-[320px] max-w-[600px] shadow-2xl rounded-sm border border-gray-100"
                : "w-full rounded-t-2xl shadow-[0_-20px_40px_rgba(15,23,42,0.16)]"
            }`}
          >
            {/* Header */}
            {!isDesktop && (
              <button
                type="button"
                onClick={() => {
                  if (mobileResizeMovedRef.current) return;
                  setMobileSheetHeight((height) => (height > 78 ? 72 : 82));
                }}
                onPointerDown={startMobileResize}
                className="flex w-full touch-none justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                aria-label={mobileSheetHeight > 78 ? "Perkecil panel laporan" : "Perbesar panel laporan"}
              >
                <span className="h-1.5 w-12 rounded-full bg-gray-200" />
              </button>
            )}

            <div
              onPointerDown={!isDesktop ? startMobileResize : undefined}
              className={`px-7 flex touch-none justify-between items-center bg-white pb-2 relative z-10 ${
              isDesktop ? "py-6 cursor-move active:cursor-grabbing" : "pt-3 pb-3"
            }`}
            >
              <div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-gray-900 tracking-tight">
                  Laporan Baru
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">Isi detail lengkap</p>
              </div>
              <button
                onClick={onClose}
                onPointerDown={(event) => event.stopPropagation()}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 space-y-7 bg-white pb-6 pt-2 hide-scrollbar">

              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-black text-gray-300 tracking-widest leading-none">
                  JUDUL LAPORAN <RequiredMark />
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
                  DETAIL KRONOLOGI <RequiredMark />
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder="Ceritakan urutan dan kondisi yang terjadi..."
                  className="rounded-sm min-h-[120px] bg-white border border-gray-200 focus:bg-gray-50 focus:border-[#db2744] focus:ring-0 transition-all font-bold text-gray-900 text-sm resize-none p-5 shadow-none leading-relaxed"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black text-gray-300 tracking-widest leading-none">
                    BUKTI FOTO <RequiredMark />
                  </Label>
                  {photoPreviews.length === 0 ? (
                    <span className="text-[10px] font-bold text-[#db2744] uppercase tracking-widest">
                      Wajib diisi
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {photoPreviews.length} foto
                    </span>
                  )}
                </div>

                {/* Preview grid */}
                <AnimatePresence>
                  {photoPreviews.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="grid grid-cols-3 gap-2"
                    >
                      {photoPreviews.map((url, index) => (
                        <motion.div
                          key={`${url}-${index}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          className="relative w-full h-[80px] rounded-sm overflow-hidden group shadow-sm"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover cursor-zoom-in"
                            onClick={() => onPhotoClick(photoPreviews, index)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                            <button
                              onClick={(e) => { e.stopPropagation(); onPhotoClick(photoPreviews, index); }}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all scale-75 group-hover:scale-100"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onRemovePhoto(index); }}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all scale-75 group-hover:scale-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {/* Nomor badge */}
                          <span className="absolute top-1 left-1 bg-black/50 text-white text-[9px] font-black rounded px-1 leading-4">
                            {index + 1}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isDesktop && (
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => cameraInputRef.current?.click()}
                      className="relative flex flex-col items-center justify-center gap-2 h-[100px] rounded-sm border-2 border-gray-200 bg-gray-50/60 hover:bg-gray-50 text-gray-500 transition-colors group overflow-hidden"
                    >
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                      <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-active:bg-white/30 transition-colors">
                        <Camera size={20} strokeWidth={2}  className="text-gray-400"/>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-none">
                        Ambil Foto
                      </span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => galleryInputRef.current?.click()}
                      className="relative flex flex-col items-center justify-center gap-2 h-[100px] rounded-sm border-2 border-gray-200 bg-gray-50/60 hover:bg-gray-50 text-gray-500 transition-colors group overflow-hidden"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Images size={20} strokeWidth={1.8} className="text-gray-400" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-none">
                        Dari Galeri
                      </span>
                    </motion.button>

                    {/* Hidden inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={onPhotoUpload}
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={onPhotoUpload}
                    />
                  </div>
                )}

                {isDesktop && (
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
                )}

                {!isDesktop && photoPreviews.length === 0 && (
                  <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                    Foto menjadi bukti pendukung laporan Anda
                  </p>
                )}
              </div>

              {/* Lokasi */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-300 tracking-widest leading-none">
                  LOKASI TERPILIH <RequiredMark />
                </Label>
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
                    className="group w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-sm border-2 border-[#db2744] text-[#db2744] hover:bg-[#db2744] hover:text-white text-[11px] font-black tracking-widest uppercase transition-all duration-200"
                  >
                    <Navigation size={15} strokeWidth={2.5} className="text-[#db2744] group-hover:text-white transition-colors duration-200" />
                    Gunakan Lokasi GPS Saya
                  </button>
                )}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-7 py-5 bg-white border-t border-gray-100">
              <Button
                onClick={onSubmit}
                disabled={isSubmitting || !title.trim() || !description.trim() || photoPreviews.length === 0}
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
