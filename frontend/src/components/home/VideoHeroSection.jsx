import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  Video,
  Volume2,
  Lightbulb,
  ChefHat,
  Utensils,
  ShieldCheck,
  Sparkles,
  Search as SearchIcon,
} from "lucide-react";
import heroVideo from "@/assets/hero_video3.mp4";
import Marquee from "@/components/Marquee";

const SERVICE_CHOICES = [
  { code: "photography", label: "Photography", icon: Camera },
  { code: "videography", label: "Videography", icon: Video },
  { code: "sound_system", label: "Sound System (DJ)", icon: Volume2 },
  { code: "lighting", label: "Lighting", icon: Lightbulb },
  { code: "chef_booking", label: "Chef Booking", icon: ChefHat },
  { code: "catering", label: "Catering", icon: Utensils },
];

const EVENT_CHIPS = [
  "Wedding",
  "Corporate",
  "Birthday",
  "Conference",
  "Anniversary",
  "Graduation",
  "Festival",
  "Concert",
  "Seminar",
  "Exhibition",
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.06 },
  }),
};

export default function Hero() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleServiceSelect = useCallback(
    (serviceCode) => {
      const qs = new URLSearchParams();
      qs.set("service_type", serviceCode);
      navigate(`/events?${qs.toString()}`);
    },
    [navigate]
  );

  const Stat = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
      <Icon className="h-5 w-5 text-white" aria-hidden />
      <div className="flex flex-col leading-tight">
        <span className="text-white/90 text-sm">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
    </div>
  );

  const services = useMemo(() => SERVICE_CHOICES, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Find event professionals for your special occasion"
    >
      {/* Background Layer */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Celebratory event clips in motion"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Layered overlays for readability */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-40">
          {/* Eyebrow / Trust */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/90 backdrop-blur"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs">
              Curated vendors • Secure booking • 24/7 support
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mt-5 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Find the perfect{" "}
            <span className="text-rose-500">
              event <br /> professionals
            </span>{" "}
            for your moment.
          </motion.h1>

          {/* Subhead */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-white/85"
          >
            Book vetted photographers, caterers, DJs, lighting experts, and
            more—designed for weddings, corporate events, concerts and beyond.
          </motion.p>
        </div>
      </div>

      {/* Decorative bottom curve (purely visual) */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black"
      />
    </section>
  );
}
