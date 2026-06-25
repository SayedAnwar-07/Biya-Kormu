import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchSuggestions } from "@/redux/slices/eventSlice";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search as SearchIcon,
  X as XIcon,
  Building2,
  User,
} from "lucide-react";

const Search = ({
  placeholder = "Search by brand or seller...",
  variant = "default",
  className = "",
  autoFocus = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimerRef = useRef(null);
  const searchRef = useRef(null);

  const { suggestions, suggestionsLoading } = useSelector(
    (state) => state.events.allEvents
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced suggestions
  useEffect(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (!query?.trim()) {
      setShowSuggestions(false);
      return;
    }
    typingTimerRef.current = setTimeout(() => {
      dispatch(fetchSearchSuggestions(query.trim()));
      setShowSuggestions(true);
    }, 250);
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [query, dispatch]);

  const handleInputChange = (e) => setQuery(e.target.value);

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const navigateToSearch = (searchParam, searchValue) => {
    const qs = new URLSearchParams();
    qs.set(searchParam, searchValue);
    navigate(`/events?${qs.toString()}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;

    const brands = suggestions?.brand_names || [];
    const sellers = suggestions?.seller_names || [];
    const qLower = q.toLowerCase();

    // Check for exact matches first
    const exactBrandMatch = brands.find((b) => b?.toLowerCase() === qLower);
    const exactSellerMatch = sellers.find((s) => s?.toLowerCase() === qLower);

    if (exactBrandMatch) {
      navigateToSearch("brand_name", exactBrandMatch);
    } else if (exactSellerMatch) {
      navigateToSearch("seller_name", exactSellerMatch);
    } else {
      // If no exact matches, check partial matches
      const partialBrandMatch = brands.find((b) =>
        b?.toLowerCase().includes(qLower)
      );
      const partialSellerMatch = sellers.find((s) =>
        s?.toLowerCase().includes(qLower)
      );

      if (partialBrandMatch) {
        navigateToSearch("brand_name", partialBrandMatch);
      } else if (partialSellerMatch) {
        navigateToSearch("seller_name", partialSellerMatch);
      } else {
        // Default to seller search if no matches found
        navigateToSearch("seller_name", q);
      }
    }

    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (value, category) => {
    setQuery(value);
    setShowSuggestions(false);
    setActiveSuggestion(-1);

    if (category === "seller") {
      navigateToSearch("seller_name", value);
    } else if (category === "brand") {
      navigateToSearch("brand_name", value);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...(suggestions.brand_names || []).map((item) => ({
        item,
        category: "brand",
      })),
      ...(suggestions.seller_names || []).map((item) => ({
        item,
        category: "seller",
      })),
    ];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < allSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      const { item, category } = allSuggestions[activeSuggestion];
      handleSuggestionClick(item, category);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const renderSuggestions = () => {
    if (!showSuggestions || !query) return null;

    const hasSuggestions =
      (suggestions.brand_names && suggestions.brand_names.length > 0) ||
      (suggestions.seller_names && suggestions.seller_names.length > 0);

    if (suggestionsLoading) {
      return (
        <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg z-50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Loading suggestions...
              </span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!hasSuggestions) {
      return (
        <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg z-50 border-border">
          <CardContent className="p-4">
            <div className="text-center py-2 text-muted-foreground">
              No brand/seller found for "{query}"
            </div>
          </CardContent>
        </Card>
      );
    }

    let indexCounter = -1;
    const renderCategory = (title, items, categoryKey, icon) => {
      if (!items?.length) return null;
      return (
        <div key={categoryKey} className="mb-2 last:mb-0">
          <div className="flex items-center px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {icon}
            <span className="ml-1">{title}</span>
          </div>
          {items.map((item, i) => {
            indexCounter++;
            const isActive = activeSuggestion === indexCounter;
            return (
              <div
                key={`${categoryKey}-${i}-${item}`}
                className={`flex items-center px-3 py-2 text-sm cursor-pointer rounded-md ${
                  isActive ? "bg-accent" : "hover:bg-accent"
                }`}
                onClick={() => handleSuggestionClick(item, categoryKey)}
                onMouseEnter={() => setActiveSuggestion(indexCounter)}
              >
                {item}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg z-50 border-border max-h-80 overflow-y-auto">
        <CardContent className="p-2">
          {renderCategory(
            "Brand names",
            suggestions.brand_names,
            "brand",
            <Building2 className="h-3.5 w-3.5" />
          )}
          {renderCategory(
            "Seller names",
            suggestions.seller_names,
            "seller",
            <User className="h-3.5 w-3.5" />
          )}
        </CardContent>
      </Card>
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "navbar":
        return "rounded-full bg-muted/50 focus-within:bg-background border-border/50 focus-within:border-primary/50 transition-colors";
      case "minimal":
        return "border-0 border-b rounded-none bg-transparent focus-within:border-primary shadow-none";
      default:
        return "rounded-md bg-background border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-ring";
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`relative flex items-center border ${getVariantStyles()} ${
            isFocused ? "border-primary ring-1 ring-ring" : ""
          }`}
        >
          <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (query.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${
              variant === "navbar" ? "pl-10 pr-10" : "pl-10 pr-10"
            } ${variant === "minimal" ? "py-1" : ""}`}
            aria-label="Search by brand or seller"
            autoFocus={autoFocus}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      {renderSuggestions()}
    </div>
  );
};

export default Search;
