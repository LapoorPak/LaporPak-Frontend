import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Building2,
  Camera,
  CircleCheck,
  ClipboardCheck,
  Lightbulb,
  Send,
  X,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { HeroWave, HeroSlash, HeroFade } from "@/components/ui/hero-svgs";
import { useAuth } from "@/hooks/auth";
import { getDashboardPathForRole } from "@/lib/auth-portal";

const IDEA_SPARKS = [
  {
    id: "spark-1",
    className: "left-3 top-5 h-2.5 w-2.5 bg-yellow-300",
    delay: 0.1,
    duration: 2.8,
    x: -6,
  },
  {
    id: "spark-3",
    className: "right-6 top-4 h-2.5 w-2.5 bg-yellow-200",
    delay: 0.2,
    duration: 2.6,
    x: 6,
  },
  {
    id: "spark-5",
    className: "left-14 bottom-6 h-2 w-2 bg-yellow-300",
    delay: 0.4,
    duration: 2.9,
    x: 12,
  },
] as const;

const IDEA_RAYS = [
  { id: "ray-1", className: "left-9 top-12 w-10 rotate-[-18deg]", delay: 0.1 },
  { id: "ray-3", className: "right-4 top-10 w-12 rotate-[16deg]", delay: 0.55 },
] as const;

const FEATURE_CARDS = [
  {
    id: "angkat-isu",
    title: "Angkat Isu",
    description: "Fotokan masalah fasilitas publik secara transparan.",
    Icon: Camera,
    DecorIcon: Camera,
  },
  {
    id: "cari-tau",
    title: "Cari Tau",
    description: "Sistem meneruskan aduan langsung ke dinas berwenang.",
    Icon: Send,
    DecorIcon: Building2,
  },
  {
    id: "bantuan",
    title: "Bantuan",
    description: "Lacak riwayat penyelesaian masalah yang dilaporkan.",
    Icon: CircleCheck,
    DecorIcon: ClipboardCheck,
  },
] as const;

export default function Home() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(1);
  const { data: session } = useAuth();
  const dashboardPath = getDashboardPathForRole(session?.user?.role);
  const primaryCtaPath = session ? dashboardPath : "/register";
  const primaryCtaLabel = session ? "Buka dashboard" : "Mulai lapor yuk!";
  const secondaryCtaPath = session ? dashboardPath : "/register";
  const secondaryCtaLabel = session
    ? "Pantau di dashboard"
    : "Pantau sekarang!";
  const getFeatureSlot = (index: number) => {
    if (index === activeFeatureIndex) return "active";
    return (index - activeFeatureIndex + FEATURE_CARDS.length) %
      FEATURE_CARDS.length ===
      1
      ? "right"
      : "left";
  };
  const showPreviousFeature = () => {
    setActiveFeatureIndex(
      (current) => (current - 1 + FEATURE_CARDS.length) % FEATURE_CARDS.length,
    );
  };
  const showNextFeature = () => {
    setActiveFeatureIndex((current) => (current + 1) % FEATURE_CARDS.length);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans relative isolate">
      <Navbar />

      {/* Prelude Hub */}
      <section className="relative z-10 h-[calc(100svh-65px)] overflow-hidden md:h-auto md:min-h-[430px] lg:h-[calc(100svh-65px)] lg:min-h-[560px]">
        <HeroWave
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[-36%] z-0 h-[65%] w-[172%] max-w-none opacity-95 md:left-[-12%] md:h-[82%] md:w-[74%] lg:left-0  lg:h-[88%] lg:w-[56%]"
        />
        <HeroSlash
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[18%] z-0 h-[18%] w-[148%] max-w-none opacity-35  md:left-[30%] md:h-24 md:w-[70%]  lg:left-[31%] lg:h-28 lg:w-[64%]"
        />
        <HeroFade
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[50%] w-full object-fill"
        />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-start gap-0 px-5 pt-[15vh] sm:px-6 sm:pt-[13vh] md:min-h-[430px] md:justify-center md:gap-8 md:pb-16 md:pt-10 lg:min-h-[390px] lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:pb-8 lg:pt-8">
          <div className="relative z-40 order-1 w-full text-center lg:w-[47%] lg:pl-6 lg:text-left xl:pl-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-3 font-heading text-[4.6rem] font-black leading-[0.82] tracking-tight text-gray-950 sm:text-[5.4rem] lg:mb-4 lg:text-[7rem] xl:text-[7.75rem]">
                70
                <span className="align-[0.05em] text-2xl font-black sm:text-3xl lg:text-[2.8rem] xl:text-[3rem]">
                  %
                </span>
              </h2>
              <h3 className="mb-4 font-heading text-[1.55rem] font-extrabold leading-[1.03] tracking-tight text-gray-950 sm:text-[2rem] md:text-[2.45rem] lg:text-[2.7rem] xl:text-[3rem]">
                <span className="lg:whitespace-nowrap">
                  Fasilitas publik terbengkalai
                </span>
                <br />
                <span className="text-[#db2744]">Tanpa Laporan.</span>
              </h3>
              <p className="mx-auto max-w-[22rem] text-sm font-medium leading-snug text-gray-600 sm:text-base md:max-w-md md:text-lg lg:mx-0 lg:max-w-[30rem] lg:text-xl">
                Infrastruktur rusak dan lingkungan tak terurus di sekitar kita.
                Berhenti menunggu.
              </p>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 order-2 flex w-full shrink-0 items-end justify-center md:pointer-events-auto md:relative md:inset-auto lg:absolute lg:inset-auto lg:bottom-0 lg:right-0 lg:w-[55%] lg:items-end lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-[245vw] max-w-none -translate-x-[4%] translate-y-0 sm:w-[220vw] sm:-translate-x-[5%] md:w-[205vw] md:-translate-x-[4%] md:translate-y-[8%] lg:w-full lg:max-w-[940px] lg:translate-x-0 lg:translate-y-0 xl:max-w-[1040px]"
            >
              <img
                src="/images/header_image.png"
                className="h-auto w-full object-contain"
                alt="LaporPak Hero"
              />
            </motion.div>
          </div>
        </div>
      </section>
      <section className="relative z-10 px-4 py-14 sm:px-6 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="mx-auto break-words font-heading text-xl font-black leading-tight tracking-tight text-[#db2744] sm:text-3xl md:text-[2.65rem]">
            #BersamaMembangunKota
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-snug text-gray-600 md:text-base">
            <span className="font-extrabold text-gray-950">
              Lapor<span className="text-[#db2744]">Pak</span>
            </span>{" "}
            hadir sebagai wadah Anda untuk menagih hak perbaikan kepada otoritas
            berwenang sekarang juga.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-10 h-[340px] max-w-md touch-pan-y overflow-hidden sm:h-[370px] sm:max-w-xl md:mt-14 md:h-[390px] md:max-w-4xl lg:mt-16 lg:h-[405px] lg:max-w-5xl">
          {FEATURE_CARDS.map((feature, index) => {
            const slot = getFeatureSlot(index);
            const isActive = slot === "active";
            const isRight = slot === "right";
            const FeatureIcon = feature.Icon;
            const FeatureDecorIcon = feature.DecorIcon;

            return (
              <motion.button
                key={feature.id}
                type="button"
                onClick={() => {
                  if (!isActive) setActiveFeatureIndex(index);
                }}
                aria-label={
                  isActive
                    ? `${feature.title} sedang aktif`
                    : `Tampilkan ${feature.title}`
                }
                aria-pressed={isActive}
                initial={false}
                animate={{
                  left:
                    slot === "active" ? "50%" : slot === "left" ? "30%" : "70%",
                  top: isActive ? "0%" : "10%",
                  height: isActive ? "100%" : "81.5%",
                  scale: isActive ? 1 : 0.96,
                  zIndex: isActive ? 20 : 10,
                }}
                transformTemplate={(_, generated) =>
                  generated === "none"
                    ? "translateX(-50%)"
                    : `translateX(-50%) ${generated}`
                }
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                whileHover={{ y: isActive ? 0 : -4 }}
                whileTap={{ scale: isActive ? 0.99 : 0.94 }}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 46) showPreviousFeature();
                  if (info.offset.x < -46) showNextFeature();
                }}
                className={`absolute top-0 flex w-[60%] max-w-[354px] flex-col overflow-hidden rounded p-4 shadow-[0_10px_24px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#db2744]/45 sm:w-[52%] sm:p-5 md:w-[354px] md:p-6 ${
                  isActive
                    ? "cursor-grab justify-end bg-gradient-to-br from-[#ff0707] to-[#b91118] text-left text-white shadow-[0_14px_28px_rgba(15,23,42,0.24)] active:cursor-grabbing sm:p-7 md:p-9"
                    : isRight
                      ? "items-end justify-between bg-white text-right text-gray-700 transition-shadow hover:shadow-[0_14px_28px_rgba(15,23,42,0.16)]"
                      : "items-start justify-between bg-white text-left text-gray-700 transition-shadow hover:shadow-[0_14px_28px_rgba(15,23,42,0.16)]"
                }`}
              >
                {isActive ? (
                  <>
                    <X
                      aria-hidden="true"
                      className="absolute -left-12 top-20 h-24 w-24 rotate-[-42deg] text-white/10 sm:h-28 sm:w-28 md:h-32 md:w-32"
                      strokeWidth={5}
                    />
                    <X
                      aria-hidden="true"
                      className="absolute left-12 top-56 h-24 w-24 rotate-[-42deg] text-white/10 sm:left-20 sm:h-28 sm:w-28 md:top-60 md:h-32 md:w-32"
                      strokeWidth={5}
                    />
                    <FeatureDecorIcon
                      aria-hidden="true"
                      className="absolute right-[-42px] top-6 h-40 w-40 text-white/16 sm:right-[-28px] sm:top-0 sm:h-56 sm:w-56 md:right-[-20px] md:h-64 md:w-64"
                      strokeWidth={2.8}
                    />
                    <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#db2744] sm:left-5 sm:top-5 sm:h-10 sm:w-10">
                      <FeatureIcon size={17} strokeWidth={3} />
                    </span>
                    <div className="relative z-10">
                      <h3 className="mb-3 text-base font-extrabold sm:mb-5 sm:text-xl">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-tight text-white sm:text-lg md:text-[1.35rem]">
                        {feature.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#db2744]/70 text-white sm:h-8 sm:w-8">
                      <FeatureIcon size={16} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="mb-2 text-xs font-bold text-gray-700 sm:mb-3 sm:text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-[0.68rem] leading-tight text-gray-500 sm:text-xs md:text-sm md:leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 hidden px-4 py-10 sm:px-6 md:py-14 lg:block">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:gap-3 lg:h-[560px] lg:grid-cols-[0.92fr_1.04fr_1.08fr_1fr_1fr] lg:grid-rows-[1.06fr_0.76fr_1.08fr]"
        >
          <figure className="order-1 col-span-2 h-36 overflow-hidden lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:h-auto">
            <img
              src="/grid/image1.png"
              alt="Fasilitas umum dengan atap rusak"
              className="h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </figure>

          <figure className="order-2 h-36 overflow-hidden lg:order-none lg:col-start-3 lg:row-start-1 lg:h-auto">
            <img
              src="/grid/image2.png"
              alt="Jalan berlubang yang perlu diperbaiki"
              className="h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </figure>

          <figure className="order-3 h-36 overflow-hidden lg:order-none lg:col-start-1 lg:row-start-2 lg:h-auto">
            <img
              src="/grid/image3.png"
              alt="Tumpukan sampah di area publik"
              className="h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </figure>

          <div className="order-4 col-span-2 flex h-[220px] flex-col justify-between bg-[#1d1d1d] p-6 text-white sm:p-8 lg:order-none lg:col-span-2 lg:col-start-4 lg:row-span-2 lg:row-start-1 lg:h-auto lg:p-9">
            <h2 className="font-heading text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl lg:text-[2.55rem]">
              Fasilitas
              <br />
              Infrastruktur
              <br />
              <span className="text-[#ff0707]">perlu perbaikan.</span>
            </h2>
            <p className="max-w-[14rem] text-xs font-medium leading-snug text-white/70 sm:text-sm">
              Lacak riwayat penyelesaian masalah yang dilaporkan.
            </p>
          </div>

          <figure className="order-5 col-span-2 h-56 overflow-hidden lg:order-none lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:h-auto">
            <img
              src="/grid/image4.png"
              alt="Dinding bangunan publik penuh coretan"
              className="h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </figure>

          <div className="order-6 flex h-40 flex-col justify-between bg-[#ff0707] p-4 text-white sm:p-5 lg:order-none lg:col-start-1 lg:row-start-3 lg:h-auto">
            <h2 className="font-heading text-2xl font-black leading-none tracking-tight sm:text-3xl">
              Laporkan.
            </h2>
            <p className="text-[0.7rem] font-medium leading-tight text-white/85 sm:text-xs">
              Lacak riwayat penyelesaian masalah yang dilaporkan.
            </p>
          </div>

          <figure className="order-7 h-40 overflow-hidden lg:order-none lg:col-span-2 lg:col-start-4 lg:row-start-3 lg:h-auto">
            <img
              src="/grid/image5.png"
              alt="Halte dan fasilitas publik yang terbengkalai"
              className="h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </figure>
        </motion.div>
      </section>

      <section className="pt-20 pb-8 relative z-10 px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-7xl mx-auto"
        >
          <div className="flex flex-col items-center text-center gap-1 md:gap-2">
            <h2 className="text-3xl md:text-[2.5rem] leading-tight font-heading font-medium text-gray-900 tracking-tight">
              <span className="font-black text-gray-950">Lapor</span>{" "}
              <span className="font-black text-[#db2744]">Pak!</span>{" "}
              menghadirkan
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
            <div className="absolute left-5 top-8 h-20 w-20 rounded-full bg-yellow-300/40 blur-3xl opacity-55" />
            <div className="absolute right-4 top-2 h-24 w-24 rounded-full bg-amber-300/45 blur-3xl opacity-50" />

            {IDEA_RAYS.map((ray) => (
              <motion.span
                key={ray.id}
                className={`absolute h-1.5 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 shadow-[0_0_18px_rgba(250,204,21,0.45)] ${ray.className}`}
                animate={{
                  opacity: [0.35, 1, 0.35],
                  scaleX: [0.8, 1.08, 0.84],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  delay: ray.delay,
                  ease: "easeInOut",
                }}
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
              animate={{
                y: [0, -7, 0],
                rotate: [-15, -12, -15],
                scale: [1, 1.03, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 3.1,
                ease: "easeInOut",
              }}
              className="relative -mr-6 z-10"
            >
              <div className="absolute inset-2 rounded-full bg-yellow-200/50 blur-2xl" />
              <Lightbulb
                size={96}
                className="relative text-yellow-400 drop-shadow-[0_8px_16px_rgba(250,204,21,0.3)]"
                strokeWidth={1.5}
                fill="#facc15"
              />
            </motion.div>

            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [5, 8, 5],
                scale: [1, 1.04, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 3.4,
                ease: "easeInOut",
                delay: 0.25,
              }}
              className="relative z-20"
            >
              <div className="absolute inset-2 rounded-full bg-amber-200/50 blur-2xl" />
              <Lightbulb
                size={112}
                className="relative text-yellow-400 drop-shadow-[0_12px_22px_rgba(250,204,21,0.36)]"
                strokeWidth={1.5}
                fill="#facc15"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 space-y-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="py-10 flex flex-col md:flex-row items-center gap-8 md:gap-14"
        >
          <div className="w-full md:w-1/2">
            <img
              src="/images/image1.png"
              alt="Sampaikan Keluhan"
              className="w-full rounded-2xl object-cover aspect-4/3"
              loading="lazy"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#db2744] tracking-tight">
              Sampaikan Keluhan
            </h3>
            <p className="text-lg md:text-xl text-gray-700 leading-[1.4]">
              Fotokan jalan berlubang, tumpukan sampah, atau fasilitas publik
              yang rusak. Sistem akan otomatis mendeteksi lokasi koordinat Anda.
            </p>
            <Link
              to={primaryCtaPath}
              className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors shadow-sm text-lg mt-2"
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="py-10 flex flex-col md:flex-row-reverse items-center gap-8 md:gap-14"
        >
          <div className="w-full md:w-1/2">
            <img
              src="/images/image2.png"
              alt="Otomatis Tepat Sasaran"
              className="w-full rounded-2xl object-cover aspect-video"
              loading="lazy"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#db2744] tracking-tight">
              Otomatis Tepat Sasaran
            </h3>
            <p className="text-lg md:text-xl text-gray-700 leading-[1.4]">
              Tidak perlu bingung mencari instansi yang berwenang. Teknologi
              kami akan memproses dan meneruskan laporan Anda ke dinas terkait
              secara otomatis.
            </p>
            <Link
              to="/cara-kerja"
              className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors cursor-pointer shadow-sm text-lg mt-2"
            >
              Lihat cara kerja!
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="py-10 flex flex-col md:flex-row items-center gap-8 md:gap-14"
        >
          <div className="w-full md:w-1/2">
            <img
              src="/images/image3.png"
              alt="Pantau Status Laporan"
              className="w-full rounded-2xl object-cover aspect-4/3"
              loading="lazy"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#db2744] tracking-tight">
              Pantau Status Laporan
            </h3>
            <p className="text-lg md:text-xl text-gray-700 leading-[1.4]">
              Ketahui perkembangan laporan Anda secara real-time. Kami menjamin
              transparansi tindak lanjut dari awal hingga masalah tuntas.
            </p>
            <Link
              to={secondaryCtaPath}
              className="inline-block bg-[#db2744] text-white font-bold px-8 py-3 rounded-full hover:bg-[#b01e33] transition-colors shadow-sm text-lg mt-2"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
