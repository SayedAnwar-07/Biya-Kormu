// HeroSection.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchSearchSuggestions } from "@/redux/slices/eventSlice";
import {
  Search,
  Sparkles,
  Camera,
  Video,
  Building,
  Volume2,
  Lightbulb,
  ChefHat,
  Utensils,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

/** Debounce hook (no external deps) */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Keep in sync with Events.jsx / AllSearch.jsx
const SERVICE_CHOICES = [
  { code: "photography", label: "Photography", icon: Camera },
  { code: "videography", label: "Videography", icon: Video },
  { code: "sound_system", label: "Sound System", icon: Volume2 },
  { code: "lighting", label: "Lighting", icon: Lightbulb },
  { code: "chef_booking", label: "Chef Booking", icon: ChefHat },
  { code: "catering", label: "Catering", icon: Utensils },
];

const SERVICE_ICON_MAP = {
  photography: Camera,
  videography: Video,
  hall_booking: Building,
  sound_system: Volume2,
  lighting: Lightbulb,
  chef_booking: ChefHat,
  catering: Utensils,
  decoration: Sparkles,
  entertainment: Sparkles,
};

const labelToServiceCode = (label) => {
  if (!label) return null;
  const hit = SERVICE_CHOICES.find(
    (x) => x.label.toLowerCase() === String(label).toLowerCase()
  );
  return hit?.code || null;
};

const chips = [
  "Wedding",
  "Corporate Event",
  "Birthday",
  "Conference",
  "Anniversary",
  "Graduation",
];

export default function HeroSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const inputRef = useRef(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Fetch live suggestions (same thunk as Events.jsx)
  useEffect(() => {
    let mounted = true;
    if (!debouncedSearch) {
      mounted && setSuggestions({});
      return;
    }
    dispatch(fetchSearchSuggestions(debouncedSearch))
      .unwrap()
      .then((res) => {
        if (!mounted) return;
        setSuggestions(res?.suggestions || {});
        setShowSuggest(true);
      })
      .catch(() => {
        if (!mounted) return;
        setSuggestions({});
        setShowSuggest(false);
      });
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, dispatch]);




  return (
    <section className="relative overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-0 pt-16 pb-14 md:pb-20 relative">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
          {/* Left: Headline + search */}
          <div className="w-full lg:w-6/12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2D2D2D] leading-tight">
              Find the perfect{" "}
              <span className="text-[#9f0712]">event professionals</span> for
              your <br /> special occasion
            </h1>

            <p className="mt-4 text-base md:text-lg text-[#2D2D2D]/90 max-w-2xl">
              Connect with skilled photographers, caterers, decorators, and more
              to make your event unforgettable.
            </p>
          </div>

          {/* Right: Service tiles */}
          <div className="w-full lg:w-6/12">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {SERVICE_CHOICES.slice(0, 9).map((s, i) => {
                  const Icon = s.icon || Sparkles;
                  return (
                    <button
                      key={s.code}
                      onClick={() => {
                        setSelectedCategory(s.code);
                        setSellerName("");
                        setBrandName("");
                        setSearchTerm("");
                        const qs = new URLSearchParams();
                        qs.set("service_type", s.code);
                        navigate(`/events?${qs.toString()}`);
                      }}
                      className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#9f0712] p-3 text-left transition"
                    >
                      <Icon className="h-5 w-5 text-[#9f0712] mx-auto" />
                      <div className="mt-2 text-sm font-medium text-[#2D2D2D] text-center">
                        {s.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* subtle divider */}
      <div className="relative h-2 bg-gradient-to-r from-[#9f0712]/10 to-transparent"></div>
    </section>
  );
}
