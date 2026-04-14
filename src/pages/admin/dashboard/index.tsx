import { useNavigate } from "react-router";
import { useGetOverview } from "@/hooks/admin";
import {
  Building2, MapPin, Tags, Users, ShieldAlert, FileText,
  TrendingUp, Activity, ArrowRight, CheckCircle, AlertCircle,
  Clock, XCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  selesai: "#22c55e",
  resolved: "#22c55e",
  proses: "#3b82f6",
  in_progress: "#3b82f6",
  menunggu: "#f59e0b",
  pending: "#f59e0b",
  ditolak: "#ef4444",
  rejected: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  selesai: "Selesai",
  resolved: "Selesai",
  proses: "Diproses",
  in_progress: "Diproses",
  menunggu: "Menunggu",
  pending: "Menunggu",
  ditolak: "Ditolak",
  rejected: "Ditolak",
};

const FALLBACK_STATUS = [
  { name: "Selesai", value: 0, color: "#22c55e" },
  { name: "Diproses", value: 0, color: "#3b82f6" },
  { name: "Menunggu", value: 0, color: "#f59e0b" },
  { name: "Ditolak", value: 0, color: "#ef4444" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

interface KPICardProps {
  title: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function KPICard({ title, value, sub, icon: Icon, color, bg }: KPICardProps) {
  return (
    <motion.div variants={cardVariants} className="group relative bg-white border border-gray-200 rounded-sm p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-5 ${bg} -translate-y-4 translate-x-4`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-sm ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        <TrendingUp size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
      </div>
      <div className="text-3xl font-heading font-black text-gray-900 mb-0.5">{value.toLocaleString()}</div>
      <div className="text-sm font-semibold text-gray-500">{title}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-sm bg-gray-100" />
      </div>
      <div className="h-8 w-20 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-28 bg-gray-100 rounded" />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm px-3 py-2 text-sm shadow-lg">
        {label && <div className="text-gray-500 text-xs mb-1">{label}</div>}
        {payload.map((p: any) => (
          <div key={p.name} className="font-bold text-gray-900">{p.value} laporan</div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm px-3 py-2 text-sm shadow-lg">
        <div className="font-bold text-gray-900">{payload[0].name}</div>
        <div className="text-gray-500">{payload[0].value} laporan</div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetOverview();

  const overview = data?.data;

  const reportStatusData = overview?.reports?.byStatus
    ? Object.entries(overview.reports.byStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] ?? key,
        value,
        color: STATUS_COLORS[key] ?? "#6b7280",
      }))
    : FALLBACK_STATUS;

  const dinasChartData = overview?.topDinas?.map((d) => ({
    name: d.short ?? d.name,
    value: d.count,
  })) ?? [
    { name: "DPU", value: 0 },
    { name: "DLHK", value: 0 },
    { name: "Dishub", value: 0 },
  ];

  const QUICK_ACTIONS = [
    { label: "Tambah Dinas", path: "/admin/dinas", icon: Building2, color: "text-blue-500", bg: "bg-blue-50 border-blue-100 hover:bg-blue-100" },
    { label: "Tambah Kategori", path: "/admin/kategori", icon: Tags, color: "text-amber-500", bg: "bg-amber-50 border-amber-100 hover:bg-amber-100" },
    { label: "Kelola Petugas", path: "/admin/users", icon: ShieldAlert, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100" },
    { label: "Data Cabang", path: "/admin/cabang", icon: MapPin, color: "text-violet-500", bg: "bg-violet-50 border-violet-100 hover:bg-violet-100" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-heading font-black text-gray-900">Selamat datang kembali</h1>
        <p className="text-gray-500 text-sm mt-1">Berikut ringkasan sistem LaporPak hari ini.</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Dinas"
              value={overview?.dinas ?? 0}
              sub={overview?.dinasActive !== undefined ? `${overview.dinasActive} aktif` : undefined}
              icon={Building2}
              color="text-blue-500"
              bg="bg-blue-50"
            />
            <KPICard
              title="Total Cabang"
              value={overview?.cabang ?? 0}
              sub={overview?.cabangActive !== undefined ? `${overview.cabangActive} aktif` : undefined}
              icon={MapPin}
              color="text-violet-500"
              bg="bg-violet-50"
            />
            <KPICard
              title="Kategori"
              value={overview?.kategori ?? 0}
              sub={overview?.kategoriActive !== undefined ? `${overview.kategoriActive} aktif` : undefined}
              icon={Tags}
              color="text-amber-500"
              bg="bg-amber-50"
            />
            <KPICard
              title="Total Laporan"
              value={overview?.reports?.total ?? 0}
              icon={FileText}
              color="text-primary"
              bg="bg-primary/10"
            />
            <KPICard
              title="Total User"
              value={overview?.users?.total ?? 0}
              sub={overview?.users?.banned ? `${overview.users.banned} diblokir` : undefined}
              icon={Users}
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
            <KPICard
              title="Petugas Aktif"
              value={overview?.petugas ?? 0}
              icon={ShieldAlert}
              color="text-rose-500"
              bg="bg-rose-50"
            />
          </>
        )}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white border border-gray-200 rounded-sm p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-primary/10 rounded-sm flex items-center justify-center">
              <Activity size={14} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Status Laporan</h3>
              <p className="text-xs text-gray-400">Distribusi status saat ini</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[200px] bg-gray-100 rounded-sm animate-pulse" />
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {reportStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {reportStatusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <div>
                      <div className="text-[11px] font-semibold text-gray-700">{entry.name}</div>
                      <div className="text-[10px] text-gray-400">{entry.value} laporan</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 bg-white border border-gray-200 rounded-sm p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 bg-primary/10 rounded-sm flex items-center justify-center">
              <Building2 size={14} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Top Dinas</h3>
              <p className="text-xs text-gray-400">Berdasarkan jumlah laporan</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[240px] bg-gray-100 rounded-sm animate-pulse" />
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dinasChartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#d1d5db"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9ca3af" }}
                  />
                  <YAxis stroke="#d1d5db" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "#9ca3af" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {dinasChartData.map((_: { name: string; value: number }, i: number) => (
                      <Cell key={i} fill={`oklch(0.50 0.22 25 / ${0.4 + (i / Math.max(dinasChartData.length, 1)) * 0.6})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4">Ringkasan Status</h3>
          <div className="space-y-3">
            {[
              { label: "Laporan Selesai", icon: CheckCircle, color: "text-emerald-500", trackColor: "bg-emerald-500", bg: "bg-emerald-50", key: ["selesai", "resolved"] },
              { label: "Sedang Diproses", icon: Clock, color: "text-blue-500", trackColor: "bg-blue-500", bg: "bg-blue-50", key: ["proses", "in_progress"] },
              { label: "Menunggu Tindakan", icon: AlertCircle, color: "text-amber-500", trackColor: "bg-amber-500", bg: "bg-amber-50", key: ["menunggu", "pending"] },
              { label: "Laporan Ditolak", icon: XCircle, color: "text-red-500", trackColor: "bg-red-500", bg: "bg-red-50", key: ["ditolak", "rejected"] },
            ].map(({ label, icon: Icon, color, trackColor, bg, key }) => {
              const count = key.reduce((acc, k) => acc + (overview?.reports?.byStatus?.[k] ?? 0), 0);
              const total = overview?.reports?.total ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-sm ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                      <span className="text-xs text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${trackColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ label, path, icon: Icon, color, bg }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-start gap-3 p-4 rounded-sm border ${bg} transition-all duration-150 text-left group`}
              >
                <Icon size={18} className={color} />
                <div>
                  <div className="text-xs font-bold text-gray-900">{label}</div>
                  <div className={`flex items-center gap-1 text-[10px] ${color} mt-0.5 group-hover:gap-2 transition-all`}>
                    Buka <ArrowRight size={10} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
