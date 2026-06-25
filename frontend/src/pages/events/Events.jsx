import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EventCard from "@/components/events/EventCard";
import AllSearch from "@/components/AllSearch";
import AllFilters from "@/components/events/AllFilters";
import {
  fetchAllEvents,
  fetchSearchSuggestions,
  selectAllEvents,
} from "@/redux/slices/eventSlice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { BASE_URL } from "@/config";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const DEFAULT_ALL_EVENTS = {
  results: [],
  count: 0,
  loading: false,
  error: null,
  suggestions: {},
  suggestionsLoading: false,
};

const orderByFromLabel = (label) => {
  switch (label) {
    case "Most Popular":
      return "-total_views";
    case "Newest First":
      return "-created_at";
    case "Oldest First":
      return "created_at";
    default:
      return "-total_views";
  }
};
const labelFromOrderBy = (orderBy) => {
  switch (orderBy) {
    case "-total_views":
      return "Most Popular";
    case "-created_at":
      return "Newest First";
    case "created_at":
      return "Oldest First";
    default:
      return "Most Popular";
  }
};

// Keep in sync with AllSearch
const SERVICE_CHOICES = [
  { code: "photography", label: "Photography" },
  { code: "videography", label: "Videography" },
  { code: "hall_booking", label: "Hall Booking" },
  { code: "sound_system", label: "Sound System (DJ)" },
  { code: "lighting", label: "Lighting" },
  { code: "chef_booking", label: "Chef Booking" },
  { code: "catering", label: "Catering" },
];
const labelToServiceCode = (label) => {
  if (!label) return null;
  const hit = SERVICE_CHOICES.find(
    (x) => x.label.toLowerCase() === String(label).toLowerCase(),
  );
  return hit?.code || null;
};

const EmptyState = ({ clearFilters }) => (
  <div className="text-center py-12 bg-white rounded-xl shadow-sm">
    <div className="text-gray-400 text-6xl mb-4">🎭</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
    <p className="text-gray-600 mb-4">
      Try adjusting your search criteria or filters
    </p>
    <button
      onClick={clearFilters}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
    >
      Clear All Filters
    </button>
  </div>
);

const LoadingIndicator = () => (
  <div className="text-center py-8">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="mt-2 text-gray-600">Loading events...</p>
  </div>
);

const LoadMoreButton = ({ onClick, loading, visible }) => {
  if (!visible) return null;
  return (
    <div className="text-center mt-8">
      <button
        onClick={onClick}
        className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Loading..." : "Load More Events"}
      </button>
    </div>
  );
};

const Events = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const allEventsState = useSelector(selectAllEvents) || DEFAULT_ALL_EVENTS;
  const globalLoading = !!allEventsState.loading;

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortLabel, setSortLabel] = useState("Most Popular");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [suggestions, setSuggestions] = useState({});
  const [showSuggest, setShowSuggest] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedSeller = useDebounce(sellerName, 500);
  const debouncedBrand = useDebounce(brandName, 500);

  // Helper to fetch with explicit params (raw or debounced)
  const fetchPage = async ({ reset = false, nextPage = 1, params }) => {
    try {
      const payload = await dispatch(fetchAllEvents(params)).unwrap();
      const newResults = payload?.results || payload || [];
      const newCount =
        typeof payload?.count === "number"
          ? payload.count
          : Array.isArray(payload)
            ? payload.length
            : 0;
      setTotalCount(newCount);
      setPage(nextPage);
      setEvents((prev) => (reset ? newResults : [...prev, ...newResults]));
    } catch (error) {
      console.error("Error fetching events:", error);
      if (reset) {
        setEvents([]);
        setTotalCount(0);
      }
    }
  };

  // Parse URL → state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    const sName = params.get("seller_name") || "";
    const bName = params.get("brand_name") || "";
    const orderBy = params.get("order_by");
    const catParam = params.get("service_type") || "";

    setSearchTerm(q);
    setSellerName(sName);
    setBrandName(bName);
    if (orderBy) setSortLabel(labelFromOrderBy(orderBy));
    setSelectedCategories(catParam ? catParam.split(",").filter(Boolean) : []);
  }, [location.search]);

  // 🔥 NEW: IMMEDIATE fetch whenever the URL changes (no debounce)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search")?.trim();
    const sName = params.get("seller_name")?.trim();
    const bName = params.get("brand_name")?.trim();
    const orderBy = params.get("order_by") || "-total_views";
    const serviceType = params.get("service_type");

    const p = {
      page: 1,
      order_by: orderBy,
    };
    if (q) p.search = q;
    if (sName) p.seller_name = sName;
    if (bName) p.brand_name = bName;
    if (serviceType) p.service_type = serviceType.split(",").filter(Boolean);

    // Immediate fetch using raw URL values
    fetchPage({ reset: true, nextPage: 1, params: p });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Debounced refetch (keeps UI in sync when user types on the Events page itself)
  useEffect(() => {
    const p = {
      page: 1,
      order_by: orderByFromLabel(sortLabel),
    };
    if (debouncedSearch?.trim()) p.search = debouncedSearch.trim();
    if (debouncedSeller?.trim()) p.seller_name = debouncedSeller.trim();
    if (debouncedBrand?.trim()) p.brand_name = debouncedBrand.trim();
    if (selectedCategories.length > 0) p.service_type = selectedCategories;

    fetchPage({ reset: true, nextPage: 1, params: p });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    debouncedSeller,
    debouncedBrand,
    selectedCategories,
    sortLabel,
  ]);

  // Keep URL updated from local edits on Events page (debounced)
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const qs = new URLSearchParams();
    if (debouncedSearch?.trim()) qs.set("search", debouncedSearch.trim());
    if (selectedCategories.length > 0)
      qs.set("service_type", selectedCategories.join(","));
    if (debouncedSeller?.trim()) qs.set("seller_name", debouncedSeller.trim());
    if (debouncedBrand?.trim()) qs.set("brand_name", debouncedBrand.trim());
    qs.set("order_by", orderByFromLabel(sortLabel));
    navigate(`/events${qs.toString() ? `?${qs}` : ""}`, { replace: true });
  }, [
    debouncedSearch,
    debouncedSeller,
    debouncedBrand,
    selectedCategories,
    sortLabel,
    navigate,
  ]);

  // Suggestions (same as before)
  useEffect(() => {
    if (!debouncedSearch) {
      setSuggestions({});
      setShowSuggest(false);
      return;
    }
    dispatch(fetchSearchSuggestions(debouncedSearch))
      .unwrap()
      .then((res) => {
        setSuggestions(res?.suggestions || {});
        setShowSuggest(true);
      })
      .catch(() => {
        setSuggestions({});
        setShowSuggest(false);
      });
  }, [debouncedSearch, dispatch]);

  const clearFilters = () => {
    setSearchTerm("");
    setSellerName("");
    setBrandName("");
    setSelectedCategories([]);
    setSortLabel("Most Popular");
    navigate("/events", { replace: true });
  };

  const toggleCategory = (categoryCode) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryCode)
        ? prev.filter((c) => c !== categoryCode)
        : [...prev, categoryCode],
    );
  };

  const selectAllCategories = () =>
    setSelectedCategories(SERVICE_CHOICES.map((s) => s.code));
  const clearAllCategories = () => setSelectedCategories([]);

  const handlePickSuggestion = (val, categoryKey) => {
    const v = val || "";
    switch (categoryKey) {
      case "seller_names":
      case "seller":
        setSellerName(v);
        setBrandName("");
        setSearchTerm("");
        break;
      case "brand_names":
      case "brand":
        setBrandName(v);
        setSellerName("");
        setSearchTerm("");
        break;
      case "service_types": {
        const code = labelToServiceCode(v);
        if (code && !selectedCategories.includes(code))
          setSelectedCategories((prev) => [...prev, code]);
        setSellerName("");
        setBrandName("");
        setSearchTerm("");
        break;
      }
      case "popular_searches":
      default:
        setSearchTerm(v);
        break;
    }
    setShowSuggest(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Helmet>
        <title>All Events - Biya Kormu</title>
        <meta
          name="description"
          content="Browse all events available on Biya Kormu. Find photography, videography, hall booking, sound system, lighting, chef booking, and catering services for your events."
        />
        <link rel="canonical" href={`${BASE_URL}/events`} />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Mobile Filters */}
        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters & Sort
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters & Sort</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <AllFilters
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  selectAllCategories={selectAllCategories}
                  clearAllCategories={clearAllCategories}
                  sortLabel={sortLabel}
                  setSortLabel={setSortLabel}
                  clearFilters={clearFilters}
                  events={events}
                  totalCount={totalCount}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl">
          <AllSearch
            searchTerm={searchTerm}
            sellerName={sellerName}
            brandName={brandName}
            selectedCategory={selectedCategories.join(",")}
            viewMode={viewMode}
            sortLabel={sortLabel}
            onSearchChange={(v) => {
              setSearchTerm(v);
              setShowSuggest(!!v);
            }}
            onSellerChange={setSellerName}
            onBrandChange={setBrandName}
            onCategoryChange={() => {}}
            onViewModeChange={setViewMode}
            onSortChange={setSortLabel}
            onClearFilters={clearFilters}
            suggestions={suggestions}
            showSuggestions={showSuggest}
            onPickSuggestion={handlePickSuggestion}
          />
        </div>

        {/* Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block w-full lg:w-1/4">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <AllFilters
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectAllCategories={selectAllCategories}
                clearAllCategories={clearAllCategories}
                sortLabel={sortLabel}
                setSortLabel={setSortLabel}
                clearFilters={clearFilters}
                events={events}
                totalCount={totalCount}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            {events.length === 0 && !globalLoading ? (
              <EmptyState clearFilters={clearFilters} />
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {events.map((ev) => (
                    <EventCard
                      key={ev.id || ev.slug}
                      event={ev}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
                {globalLoading && <LoadingIndicator />}
              </>
            )}

            <LoadMoreButton
              onClick={async () => {
                const nextPage = page + 1;
                const p = {
                  page: nextPage,
                  order_by: orderByFromLabel(sortLabel),
                };
                if (debouncedSearch?.trim()) p.search = debouncedSearch.trim();
                if (debouncedSeller?.trim())
                  p.seller_name = debouncedSeller.trim();
                if (debouncedBrand?.trim())
                  p.brand_name = debouncedBrand.trim();
                if (selectedCategories.length > 0)
                  p.service_type = selectedCategories;
                await fetchPage({ reset: false, nextPage, params: p });
              }}
              loading={globalLoading}
              visible={events.length > 0 && events.length < totalCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
