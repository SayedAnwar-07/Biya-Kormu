import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  Video,
  Volume2,
  Lightbulb,
  ChefHat,
  Utensils,
  Sparkles,
} from "lucide-react";
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

const FilterSection = () => {
  const navigate = useNavigate();
  const services = useMemo(() => SERVICE_CHOICES, []);

  const handleServiceSelect = useCallback(
    (serviceCode) => {
      const qs = new URLSearchParams();
      qs.set("service_type", serviceCode);
      navigate(`/events?${qs.toString()}`);
    },
    [navigate]
  );

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-16">
        {/* Event chips marquee */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="rounded-2xl mb-10">
            <Marquee pauseOnHover duration={22} gradient gradientWidth="6rem">
              {EVENT_CHIPS.map((chip, idx) => (
                <span
                  key={idx}
                  className="mx-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800"
                >
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  {chip}
                </span>
              ))}
            </Marquee>
          </div>
        </motion.div>

        {/* Services grid */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.code}
                  onClick={() => handleServiceSelect(s.code)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.45 }}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-4 hover:bg-rose-500/20 hover:border-rose-300/40 transition-colors"
                  aria-label={`Browse ${s.label}`}
                >
                  <Icon className="mb-2 h-6 w-6 text-gray-700 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                    {s.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FilterSection;
