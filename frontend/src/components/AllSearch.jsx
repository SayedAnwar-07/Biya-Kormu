import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Search as SearchIcon,
  Grid,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";

const SERVICE_CHOICES = [
  { code: "photography", label: "Photography" },
  { code: "videography", label: "Videography" },
  { code: "hall_booking", label: "Hall Booking" },
  { code: "sound_system", label: "Sound System (DJ)" },
  { code: "lighting", label: "Lighting" },
  { code: "chef_booking", label: "Chef Booking" },
  { code: "catering", label: "Catering" },
];

const AllSearch = ({
  searchTerm,
  sellerName,
  brandName,
  viewMode,
  onSearchChange,
  onSellerChange,
  onBrandChange,
  onViewModeChange,
  onClearFilters,
  suggestions = {},
  onPickSuggestion,
  showSuggestions = false,
  onSubmit, 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localShowSuggestions, setLocalShowSuggestions] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => setLocalShowSuggestions(showSuggestions), [showSuggestions]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setLocalShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const categoryOptions = useMemo(
    () => [{ code: "all", label: "All Categories" }, ...SERVICE_CHOICES],
    []
  );

  const SuggestRow = ({ title, items = [], categoryKey }) => {
    if (!items?.length) return null;
    return (
      <div>
        <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500">
          {title}
        </div>
        {items.map((t, i) => (
          <button
            key={`${title}-${i}-${t}`}
            onClick={() => onPickSuggestion?.(t, categoryKey)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm truncate"
            title={t}
          >
            {t}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-xl p-3 md:p-6 mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="w-full lg:max-w-xl relative" ref={dropRef}>
          <div className="relative">
            <input
              type="text"
              autoComplete="off"
              inputMode="search"
              enterKeyHint="search"
              value={searchTerm}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                setLocalShowSuggestions(!!e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit?.();
                }
              }}
              onFocus={() => setLocalShowSuggestions(!!searchTerm)}
              placeholder="Search events by brand name or seller name"
              aria-label="Search events"
              className="w-full pl-10 pr-10 py-3 border border-[#ff4956] rounded-lg focus:ring-1 focus:ring-[#ff4956] outline-none"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            {searchTerm ? (
              <button
                aria-label="Clear search"
                onClick={() => {
                  onSearchChange?.("");
                  setLocalShowSuggestions(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            ) : null}
          </div>

          {/* Suggestions */}
          {localShowSuggestions && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="max-h-80 overflow-auto py-2">
                <SuggestRow
                  title="Brand matches"
                  items={suggestions.brand_names}
                  categoryKey="brand_names"
                />
                <SuggestRow
                  title="Seller matches"
                  items={suggestions.seller_names}
                  categoryKey="seller_names"
                />
                <SuggestRow
                  title="Service types"
                  items={suggestions.service_types}
                  categoryKey="service_types"
                />
                <SuggestRow
                  title="Popular searches"
                  items={suggestions.popular_searches}
                  categoryKey="popular_searches"
                />
                {!suggestions.brand_names?.length &&
                  !suggestions.seller_names?.length &&
                  !suggestions.service_types?.length &&
                  !suggestions.popular_searches?.length && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No suggestions found
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSubmit?.()}
            className="flex items-center gap-2 px-4 py-3 bg-[#ff4956] text-white rounded-lg hover:bg-red-700"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="hidden lg:flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              aria-label="Grid view"
              onClick={() => onViewModeChange?.("grid")}
              className={`p-3 ${
                viewMode === "grid"
                  ? "bg-[#ff4956] text-white"
                  : "text-[#ff4956] hover:bg-gray-50"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              aria-label="List view"
              onClick={() => onViewModeChange?.("list")}
              className={`p-3 ${
                viewMode === "list"
                  ? "bg-[#ff4956] text-white"
                  : "text-[#ff4956] hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`mt-6 pt-6 border-t border-gray-200 ${
          showFilters ? "" : "hidden lg:block"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Seller */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller
            </label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => onSellerChange?.(e.target.value)}
              placeholder="search seller full name"
              className="w-full py-2 px-2 md:px-4 border  border-[#ff4956] rounded-lg focus:ring-1 focus:ring-[#ff4956] outline-none"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => onBrandChange?.(e.target.value)}
              placeholder="search any brand name"
              className="w-full py-2 px-2 md:px-4 border  border-[#ff4956] rounded-lg focus:ring-1 focus:ring-[#ff4956] outline-none"
            />
          </div>

          {/* Clear */}
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 bg-[#ff4956] text-sm text-white border border-gray-300 rounded-lg hover:bg-red-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSearch;
