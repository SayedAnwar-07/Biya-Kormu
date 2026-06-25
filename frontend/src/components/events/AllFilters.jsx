import React from "react";
import { X } from "lucide-react";

const SERVICE_CHOICES = [
  { code: "photography", label: "Photography" },
  { code: "videography", label: "Videography" },
  { code: "hall_booking", label: "Hall Booking" },
  { code: "sound_system", label: "Sound System (DJ)" },
  { code: "lighting", label: "Lighting" },
  { code: "chef_booking", label: "Chef Booking" },
  { code: "catering", label: "Catering" },
];

const AllFilters = ({
  selectedCategories,
  toggleCategory,
  selectAllCategories,
  clearAllCategories,
  sortLabel,
  setSortLabel,
  clearFilters,
  events,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-lg mb-4 text-gray-900 border-b pb-2">
        Filter Events
      </h3>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {events.length} of {totalCount} events
        </p>
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCategories.map((cat) => {
              const service = SERVICE_CHOICES.find((s) => s.code === cat);
              return service ? (
                <span
                  key={cat}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ff4956] text-white"
                >
                  {service.label}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="ml-1.5 text-white hover:text-red-200"
                    aria-label={`Remove ${service.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-700">Categories</h4>
          <div className="flex space-x-2">
            <button
              onClick={selectAllCategories}
              className="text-xs bg-[#ff4956] text-white px-2 py-1 rounded hover:bg-red-600"
            >
              All
            </button>
            <button
              onClick={clearAllCategories}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {SERVICE_CHOICES.map((service) => (
            <div key={service.code} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${service.code}`}
                checked={selectedCategories.includes(service.code)}
                onChange={() => toggleCategory(service.code)}
                className="h-4 w-4 rounded" // ✅ only size & shape, color from raw CSS
              />
              <label
                htmlFor={`category-${service.code}`}
                className="ml-2 text-gray-700"
              >
                {service.label}
              </label>
            </div>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <div className="mt-2 text-sm text-[#ff4956]">
            {selectedCategories.length} selected
          </div>
        )}
      </div>

      {/* Sorting Options */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
        <div className="space-y-2">
          {["Most Popular", "Newest First", "Oldest First"].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`sort-${option.toLowerCase().replace(/\s+/g, "-")}`}
                name="sorting"
                checked={sortLabel === option}
                onChange={() => setSortLabel(option)}
                className="h-4 w-4" // ✅ only size, color handled by raw CSS
              />
              <label
                htmlFor={`sort-${option.toLowerCase().replace(/\s+/g, "-")}`}
                className="ml-2 text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="w-full py-2 px-4 bg-[#ff4956] text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default AllFilters;
