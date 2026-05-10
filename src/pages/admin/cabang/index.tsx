import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetDinas,
  useGetCabang,
  useCreateCabang,
  useUpdateCabang,
  useDeleteCabang,
} from "@/hooks/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { Cabang } from "@/types/admin";
import {
  Plus,
  Search,
  MapPin,
  Building2,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Users,
  Route as RouteIcon,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Radio,
  Navigation,
  ImagePlus,
  Loader2,
  FileText,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/config/api-client";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  useMap,
} from "@/components/ui/map";
import type { MapMouseEvent } from "maplibre-gl";

const schema = z.object({
  dinasId: z.string().min(1, "Dinas harus dipilih"),
  name: z.string().min(1, "Nama tidak boleh kosong"),
  wilayah: z.string().min(1, "Wilayah tidak boleh kosong"),
  address: z.string().optional().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  cityRegency: z.string().optional().nullable(),
  coverageRadiusKm: z.number().nullable().optional(),
  isRoutingEnabled: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const LIMIT = 20;
const MAX_PHOTOS = 5;

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  const { map, isLoaded } = useMap();
  const cbRef = useCallback(
    (lat: number, lng: number) => onMapClick(lat, lng),
    [onMapClick],
  );
  useEffect(() => {
    if (!map || !isLoaded) return;
    const handler = (e: MapMouseEvent) => cbRef(e.lngLat.lat, e.lngLat.lng);
    map.on("click", handler);
    map.getCanvas().style.cursor = "crosshair";
    return () => {
      map.off("click", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [map, isLoaded, cbRef]);
  return null;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-4 w-36 bg-gray-100 rounded mb-1.5" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-20 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-16 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="h-6 w-14 bg-gray-100 rounded ml-auto" />
      </td>
    </tr>
  );
}

function getPhotoUrl(url: string) {
  return resolvePhotoUrl(url);
}

function PhotoLightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const prev = useCallback(
    () => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-9999 bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        onClick={onClose}
      >
        <X size={18} />
      </button>
      {images.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold tracking-widest">
          {current + 1} / {images.length}
        </span>
      )}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        src={getPhotoUrl(images[current])}
        alt={`Foto ${current + 1}`}
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}

export default function AdminCabangPage() {
  const [search, setSearch] = useState("");
  const [filterDinas, setFilterDinas] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCabang, setSelectedCabang] = useState<Cabang | null>(null);
  const selectCabang = (c: Cabang) => {
    setSelectedCabang(c);
    setDetailPhotoIndex(0);
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cabang | null>(null);
  const [serviceTagInput, setServiceTagInput] = useState("");
  const [serviceTags, setServiceTags] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [formPhotoIndex, setFormPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { data: dinasData } = useGetDinas({ limit: 1000 });

  const { data, isLoading } = useGetCabang(
    {
      search: search || undefined,
      dinasId: filterDinas || undefined,
      page,
      limit: LIMIT,
    },
    { placeholderData: (prev) => prev },
  );

  const cabangList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isRoutingEnabled: true, coverageRadiusKm: 5 },
  });
  const isRoutingVal = watch("isRoutingEnabled");
  const latVal = watch("latitude");
  const lngVal = watch("longitude");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CABANG] });

  const createMutation = useCreateCabang({
    onSuccess: () => {
      toast.success("Cabang berhasil ditambahkan");
      invalidate();
      closeDrawer();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menambahkan"),
  });

  const updateMutation = useUpdateCabang({
    onSuccess: () => {
      toast.success("Cabang berhasil diperbarui");
      invalidate();
      closeDrawer();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menyimpan"),
  });

  const deleteMutation = useDeleteCabang({
    onSuccess: () => {
      toast.success("Cabang berhasil dihapus");
      invalidate();
      setDeleteTarget(null);
      if (deleteTarget?.id === selectedCabang?.id) setSelectedCabang(null);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  const openDrawer = (c?: Cabang) => {
    reset({ isRoutingEnabled: true, coverageRadiusKm: 5 });
    setEditId(null);
    setServiceTags([]);
    setPhotoUrls([]);
    if (c) {
      setEditId(c.id);
      (Object.keys(schema.shape) as (keyof FormValues)[]).forEach((key) => {
        setValue(key, (c as any)[key] ?? undefined);
      });
      setServiceTags(c.serviceTags ?? []);
      setPhotoUrls(c.photos ?? []);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    reset();
    setEditId(null);
    setServiceTags([]);
    setServiceTagInput("");
    setPhotoUrls([]);
    setFormPhotoIndex(0);
  };

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, serviceTags, photos: photoUrls };
    if (editId) updateMutation.mutate({ id: editId, data: payload });
    else createMutation.mutate(payload);
  };

  const addTag = () => {
    const t = serviceTagInput.trim();
    if (t && !serviceTags.includes(t)) setServiceTags((prev) => [...prev, t]);
    setServiceTagInput("");
  };
  const removeTag = (t: string) =>
    setServiceTags((prev) => prev.filter((x) => x !== t));
  const onTagKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !serviceTagInput && serviceTags.length > 0) {
      setServiceTags((prev) => prev.slice(0, -1));
    }
  };

  const uploadPhotoFiles = async (files: FileList) => {
    if (photoUrls.length + files.length > MAX_PHOTOS) {
      toast.error(`Maksimal ${MAX_PHOTOS} foto`);
      return;
    }
    setUploadingPhotos(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("image", file);
        const res = await apiClient.post<{ data: { url: string } }>(
          "/upload/image",
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        uploaded.push(res.data.data.url);
      } catch (error) {
        toast.error(`Gagal mengupload ${file.name}`, {
          description: error instanceof Error ? error.message : "Upload gagal.",
        });
      }
    }
    if (uploaded.length > 0) {
      setPhotoUrls((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} foto berhasil diupload`);
    }
    setUploadingPhotos(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-16 h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-heading font-black text-gray-900">
            Cabang Management
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Kelola unit & lokasi cabang dinas.
          </p>
        </div>
        <Button
          onClick={() => openDrawer()}
          className="bg-primary hover:bg-primary/90 text-white rounded-sm gap-2 font-bold px-5 shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Tambah Cabang
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-sm flex flex-col overflow-hidden min-h-[500px] shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center bg-gray-50/80 shrink-0">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                placeholder="Cari cabang..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 h-8 bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-sm placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <select
              value={filterDinas}
              onChange={(e) => {
                setFilterDinas(e.target.value);
                setPage(1);
              }}
              className="h-8 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-sm px-2 focus:outline-none focus:border-primary appearance-none"
            >
              <option value="">Semua Dinas</option>
              {dinasData?.data?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short ?? d.name}
                </option>
              ))}
            </select>
            {meta && (
              <span className="text-xs text-gray-400 ml-auto">
                {meta.total} total
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Cabang
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Induk Dinas
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Routing
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : cabangList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-sm bg-gray-100 flex items-center justify-center">
                          <MapPin size={20} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          Tidak ada cabang ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cabangList.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => selectCabang(c)}
                      className={`border-b border-gray-100 cursor-pointer transition-all group ${
                        selectedCabang?.id === c.id
                          ? "bg-primary/8 border-l-2 border-l-primary"
                          : "hover:bg-gray-50 border-l-2 border-l-transparent"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 text-sm">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {c.cityRegency ?? c.wilayah}
                          </span>
                          {c.coverageRadiusKm && (
                            <span className="text-gray-400 ml-1">
                              • {c.coverageRadiusKm}km
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-700 font-semibold flex items-center gap-1">
                          <Building2
                            size={11}
                            className="text-gray-400 shrink-0"
                          />
                          {c.dinas?.short ?? c.dinas?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${
                            c.isRoutingEnabled
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          <Radio size={8} />
                          {c.isRoutingEnabled ? "Aktif" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawer(c);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(c);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">
                Hal. {page}/{totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm flex flex-col overflow-hidden min-h-[400px] shadow-sm">
          <AnimatePresence mode="wait">
            {selectedCabang ? (
              <motion.div
                key={selectedCabang.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col h-full"
              >
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-start justify-between shrink-0">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
                      {selectedCabang.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-semibold">
                        {selectedCabang.dinas?.short ??
                          selectedCabang.dinas?.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold ${
                          selectedCabang.isRoutingEnabled
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${selectedCabang.isRoutingEnabled ? "bg-emerald-500" : "bg-gray-300"}`}
                        />
                        {selectedCabang.isRoutingEnabled
                          ? "Routing On"
                          : "Routing Off"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => openDrawer(selectedCabang)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedCabang)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Induk Dinas
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                      {selectedCabang.dinas?.name ?? "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Nama / Unit
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                        {selectedCabang.name}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Wilayah
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                        {selectedCabang.wilayah}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Alamat Lengkap
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm text-gray-700 min-h-[56px] leading-relaxed">
                      {selectedCabang.address ?? "—"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Lokasi
                      </label>
                      {selectedCabang.latitude && selectedCabang.longitude && (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {Number(selectedCabang.latitude).toFixed(5)},{" "}
                          {Number(selectedCabang.longitude).toFixed(5)}
                        </span>
                      )}
                    </div>
                    <div className="h-44 border border-gray-200 rounded-sm overflow-hidden relative bg-gray-100">
                      {selectedCabang.latitude && selectedCabang.longitude ? (
                        <Map
                          theme="dark"
                          viewport={{
                            center: [
                              Number(selectedCabang.longitude),
                              Number(selectedCabang.latitude),
                            ],
                            zoom: 14,
                          }}
                          className="w-full h-full"
                        >
                          <MapControls position="bottom-right" showZoom />
                          <MapMarker
                            longitude={Number(selectedCabang.longitude)}
                            latitude={Number(selectedCabang.latitude)}
                          >
                            <MarkerContent>
                              <div className="relative flex h-5 w-5">
                                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                                <div className="relative inline-flex rounded-full h-5 w-5 bg-primary border-2 border-white shadow-lg" />
                              </div>
                            </MarkerContent>
                          </MapMarker>
                        </Map>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Navigation size={24} className="mb-1.5 opacity-40" />
                          <p className="text-xs">Koordinat tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        No. Telp
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-2 h-9 flex items-center text-sm text-gray-700 truncate">
                        {selectedCabang.phone ?? "—"}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Kota/Kab
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-2 h-9 flex items-center text-sm text-gray-700 truncate">
                        {selectedCabang.cityRegency ?? "—"}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Radius
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-2 h-9 flex items-center text-sm text-gray-700">
                        {selectedCabang.coverageRadiusKm
                          ? `${selectedCabang.coverageRadiusKm} km`
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Petugas
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm font-bold text-gray-900 gap-1.5">
                        <Users size={12} className="text-gray-400" />
                        {selectedCabang._count?.petugas ?? 0} orang
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Laporan
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm font-bold text-gray-900 gap-1.5">
                        <FileText size={12} className="text-gray-400" />
                        {selectedCabang._count?.laporan ?? 0} laporan
                      </div>
                    </div>
                  </div>

                  {(selectedCabang.serviceTags?.length ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Service Tags
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCabang.serviceTags!.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between p-3 rounded-sm border ${selectedCabang.isRoutingEnabled ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <RouteIcon
                          size={13}
                          className={
                            selectedCabang.isRoutingEnabled
                              ? "text-emerald-500"
                              : "text-gray-400"
                          }
                        />
                        Auto Routing Laporan
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {selectedCabang.isRoutingEnabled
                          ? "Cabang menerima laporan otomatis berdasarkan lokasi."
                          : "Routing dimatikan."}
                      </p>
                    </div>
                    {selectedCabang.isRoutingEnabled ? (
                      <ToggleRight
                        size={26}
                        className="text-emerald-500 shrink-0"
                      />
                    ) : (
                      <ToggleLeft
                        size={26}
                        className="text-gray-400 shrink-0"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Foto Cabang
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {selectedCabang.photos?.length ?? 0}/5
                      </span>
                    </div>
                    {(selectedCabang.photos?.length ?? 0) > 0 ? (
                      <div className="relative bg-gray-900 rounded-sm overflow-hidden h-40">
                        <button
                          type="button"
                          className="absolute inset-0 w-full h-full cursor-zoom-in z-1 group"
                          onClick={() =>
                            setLightbox({
                              images: selectedCabang.photos!,
                              index: detailPhotoIndex,
                            })
                          }
                        >
                          <img
                            src={getPhotoUrl(
                              selectedCabang.photos![detailPhotoIndex],
                            )}
                            alt=""
                            className="w-full h-full object-cover opacity-90"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <ZoomIn
                            size={16}
                            className="absolute top-2 right-2 text-white/70 drop-shadow opacity-0 group-hover:opacity-100 transition-opacity z-2"
                          />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        {selectedCabang.photos!.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setDetailPhotoIndex((i) =>
                                  i > 0
                                    ? i - 1
                                    : selectedCabang.photos!.length - 1,
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10 transition-colors"
                            >
                              <ChevronLeft size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDetailPhotoIndex((i) =>
                                  i < selectedCabang.photos!.length - 1
                                    ? i + 1
                                    : 0,
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10 transition-colors"
                            >
                              <ChevronRight size={13} />
                            </button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                              {selectedCabang.photos!.map(
                                (_: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all ${idx === detailPhotoIndex ? "bg-white w-3" : "bg-white/50 w-1"}`}
                                  />
                                ),
                              )}
                            </div>
                          </>
                        )}
                        <div className="absolute bottom-2 right-3 z-10 text-white/70 text-[10px] font-mono">
                          {detailPhotoIndex + 1}/{selectedCabang.photos!.length}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[100px] border-2 border-dashed border-gray-200 rounded-sm bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={20} className="mb-1 opacity-40" />
                        <span className="text-[11px]">Tidak ada foto</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-sm bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                  <MapPin size={24} className="text-gray-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-500 mb-1.5">
                  Pilih cabang
                </h3>
                <p className="text-xs text-gray-400 max-w-[180px] leading-relaxed">
                  Klik baris di tabel untuk melihat detail, peta, dan foto
                  lokasi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-gray-200 z-[70] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-heading font-black text-base text-gray-900">
                    {editId ? "Edit Cabang" : "Tambah Cabang Baru"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Lengkapi data lokasi & operasional.
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <form
                  id="cabang-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Induk Dinas *
                    </label>
                    <select
                      {...register("dinasId")}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-sm h-9 px-3 text-sm focus:outline-none focus:border-primary appearance-none transition-colors"
                    >
                      <option value="">— Pilih Dinas —</option>
                      {dinasData?.data?.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.dinasId && (
                      <p className="text-red-500 text-xs">
                        {errors.dinasId.message as string}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Nama Cabang / Unit *
                      </label>
                      <Input
                        placeholder="cth: UPTD Wilayah I"
                        {...register("name")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs">
                          {errors.name.message as string}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Wilayah *
                      </label>
                      <Input
                        placeholder="cth: Jakarta Barat"
                        {...register("wilayah")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                      {errors.wilayah && (
                        <p className="text-red-500 text-xs">
                          {errors.wilayah.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Alamat Lengkap
                    </label>
                    <Textarea
                      placeholder="Jl. Raya No. 1..."
                      {...register("address")}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary resize-none h-16"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Lokasi
                      </label>
                      {latVal != null && lngVal != null && (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {Number(latVal).toFixed(5)},{" "}
                          {Number(lngVal).toFixed(5)}
                        </span>
                      )}
                    </div>
                    <div className="h-52 border border-gray-200 rounded-sm overflow-hidden relative">
                      <Map
                        theme="light"
                        viewport={{
                          center: [lngVal ?? 106.8456, latVal ?? -6.2088],
                          zoom: latVal != null ? 13 : 9,
                        }}
                        className="w-full h-full"
                      >
                        <MapControls position="bottom-right" showZoom />
                        <MapClickHandler
                          onMapClick={(lat, lng) => {
                            setValue("latitude", lat);
                            setValue("longitude", lng);
                          }}
                        />
                        {latVal != null && lngVal != null && (
                          <MapMarker
                            longitude={lngVal}
                            latitude={latVal}
                            draggable
                            onDragEnd={({ lat, lng }) => {
                              setValue("latitude", lat);
                              setValue("longitude", lng);
                            }}
                          >
                            <MarkerContent>
                              <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-lg" />
                            </MarkerContent>
                          </MapMarker>
                        )}
                      </Map>
                      {latVal == null && lngVal == null && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-[11px] text-gray-500 bg-white/80 px-2.5 py-1.5 rounded-sm border border-gray-200 shadow-sm">
                            Klik peta untuk menentukan lokasi
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        No. Telp
                      </label>
                      <Input
                        placeholder="021-..."
                        {...register("phone")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Kota/Kab
                      </label>
                      <Input
                        placeholder="Jakarta Barat"
                        {...register("cityRegency")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Radius (km)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="5"
                        {...register("coverageRadiusKm", {
                          setValueAs: (v) =>
                            v === "" || v == null ? null : Number(v),
                        })}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Service Tags
                    </label>
                    <div className="min-h-[38px] bg-gray-50 border border-gray-200 rounded-sm px-3 py-1.5 flex flex-wrap gap-1.5 focus-within:border-primary transition-colors">
                      {serviceTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs text-gray-700 px-2 py-0.5 rounded-sm shadow-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-gray-400 hover:text-red-500 ml-0.5"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        value={serviceTagInput}
                        onChange={(e) => setServiceTagInput(e.target.value)}
                        onKeyDown={onTagKeyDown}
                        onBlur={addTag}
                        placeholder={
                          serviceTags.length === 0 ? "Ketik lalu Enter..." : ""
                        }
                        className="flex-1 min-w-[80px] bg-transparent text-gray-900 text-xs placeholder:text-gray-400 outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Tekan Enter untuk menambah tag.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setValue("isRoutingEnabled", !isRoutingVal)}
                    className={`w-full flex items-center justify-between p-4 rounded-sm border transition-colors ${
                      isRoutingVal
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <RouteIcon
                          size={14}
                          className={
                            isRoutingVal ? "text-emerald-500" : "text-gray-400"
                          }
                        />
                        Auto Routing Laporan
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {isRoutingVal
                          ? "Cabang menerima laporan otomatis berdasarkan lokasi."
                          : "Routing dimatikan."}
                      </p>
                    </div>
                    {isRoutingVal ? (
                      <ToggleRight
                        size={28}
                        className="text-emerald-500 shrink-0"
                      />
                    ) : (
                      <ToggleLeft
                        size={28}
                        className="text-gray-400 shrink-0"
                      />
                    )}
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Foto Cabang
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {photoUrls.length}/{MAX_PHOTOS}
                      </span>
                    </div>

                    {photoUrls.length > 0 && (
                      <div
                        className="relative bg-gray-900 rounded-sm overflow-hidden"
                        style={{ height: 140 }}
                      >
                        <button
                          type="button"
                          className="absolute inset-0 w-full h-full cursor-zoom-in z-1 group"
                          onClick={() =>
                            setLightbox({
                              images: photoUrls,
                              index: formPhotoIndex,
                            })
                          }
                        >
                          <img
                            src={getPhotoUrl(photoUrls[formPhotoIndex])}
                            alt={`Foto ${formPhotoIndex + 1}`}
                            className="w-full h-full object-cover opacity-90"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <ZoomIn
                            size={16}
                            className="absolute top-2 left-2 text-white/70 drop-shadow opacity-0 group-hover:opacity-100 transition-opacity z-2"
                          />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrls((prev) => {
                              const next = prev.filter(
                                (_, j) => j !== formPhotoIndex,
                              );
                              setFormPhotoIndex((i) =>
                                Math.min(i, Math.max(0, next.length - 1)),
                              );
                              return next;
                            });
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full shadow hover:bg-red-600 transition-colors z-10"
                        >
                          <Trash2 size={11} />
                        </button>
                        {photoUrls.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setFormPhotoIndex((i) => Math.max(0, i - 1))
                              }
                              disabled={formPhotoIndex === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-colors"
                            >
                              <ChevronLeft size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormPhotoIndex((i) =>
                                  Math.min(photoUrls.length - 1, i + 1),
                                )
                              }
                              disabled={formPhotoIndex === photoUrls.length - 1}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-colors"
                            >
                              <ChevronRight size={13} />
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {photoUrls.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFormPhotoIndex(idx)}
                                  className={`h-1 rounded-full transition-all ${idx === formPhotoIndex ? "bg-white w-3" : "bg-white/50 w-1"}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        <div className="absolute bottom-2 right-3 text-[10px] text-white/70 font-mono">
                          {formPhotoIndex + 1}/{photoUrls.length}
                        </div>
                      </div>
                    )}

                    {photoUrls.length < MAX_PHOTOS && (
                      <div className="relative w-full h-[100px] rounded-sm border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-400 transition-all cursor-pointer group overflow-hidden">
                        {uploadingPhotos ? (
                          <>
                            <Loader2
                              size={22}
                              className="mb-1.5 animate-spin text-primary"
                            />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                              Mengupload...
                            </span>
                          </>
                        ) : (
                          <>
                            <ImagePlus
                              size={22}
                              className="mb-1.5 text-gray-300 group-hover:text-gray-400 transition-colors"
                            />
                            <span className="text-[11px] font-bold uppercase tracking-widest">
                              Pilih Foto
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              JPEG, PNG, WebP • Maks. 5MB
                            </span>
                          </>
                        )}
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          disabled={uploadingPhotos}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              uploadPhotoFiles(e.target.files);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
                <Button
                  variant="ghost"
                  onClick={closeDrawer}
                  className="flex-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  form="cabang-form"
                  disabled={isPending || uploadingPhotos}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold shadow-sm shadow-primary/20"
                >
                  {isPending
                    ? "Menyimpan..."
                    : editId
                      ? "Simpan Perubahan"
                      : "Tambah Cabang"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            images={lightbox.images}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-sm shadow-2xl p-6 relative z-10 max-w-sm w-full"
            >
              <div className="w-12 h-12 rounded-sm bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
              <h3 className="text-base font-heading font-black text-gray-900 mb-1">
                Hapus Cabang?
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                <span className="text-gray-900 font-semibold">
                  {deleteTarget.name}
                </span>{" "}
                akan dihapus permanen.
              </p>
              {((deleteTarget._count?.petugas ?? 0) > 0 ||
                (deleteTarget._count?.laporan ?? 0) > 0) && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-sm text-xs text-amber-700 mb-3">
                  <p className="font-bold mb-1">Tidak dapat dihapus!</p>
                  <p>
                    Masih ada{" "}
                    <strong>{deleteTarget._count?.petugas ?? 0} petugas</strong>{" "}
                    dan{" "}
                    <strong>{deleteTarget._count?.laporan ?? 0} laporan</strong>
                    .
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setDeleteTarget(null)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 rounded-sm bg-red-500 hover:bg-red-600 text-white font-bold"
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={
                    deleteMutation.isPending ||
                    (deleteTarget._count?.petugas ?? 0) > 0 ||
                    (deleteTarget._count?.laporan ?? 0) > 0
                  }
                >
                  {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
