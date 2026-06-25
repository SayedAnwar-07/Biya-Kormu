import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Eye, ChevronRight, User } from "lucide-react";

const EventCard = ({ event }) => {
  const [showAllServices, setShowAllServices] = useState(false);

  if (!event) return null;

  const {
    slug,
    title,
    brand_name,
    description,
    logo,
    total_reviews,
    average_rating,
    total_views,
    service_details,
    gallery_images,
    seller_info,
  } = event;

  const primaryImage =
    gallery_images?.find((img) => img.is_primary) || gallery_images?.[0];
  const imageUrl = primaryImage?.image || "/placeholder-event.jpg";

  const availableServices =
    service_details?.filter((service) => service.is_available) || [];

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-[#ff4956]">
      <Link to={`/events/${slug}`}>
        <div className="relative overflow-hidden aspect-video">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-event.jpg";
            }}
          />
          <div className="absolute top-3 flex justify-between p-2 w-full">
            <div className="">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-800 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#ff4956]" />
                {seller_info?.phone_number || "Location"}
              </div>
            </div>
            <div className="">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-800 flex items-center gap-1">
                <Eye className="h-3 w-3 text-[#ff4956]" />
                {total_views} views
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-black truncate mb-1 hover:underline hover:text-[#ff4956]">
              <Link to={`/events/${slug}`}>{brand_name}</Link>
            </p>
            {/* reviews and rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {parseFloat(average_rating || 0).toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({total_reviews} review{total_reviews !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
          </div>
          {logo && (
            <img
              src={logo}
              alt={`${brand_name} logo`}
              className="w-10 h-10 rounded-full object-cover ml-3 flex-shrink-0 border border-red-100"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>

        {/* services */}
        <div className="mb-4 h-28">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-800">Services</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(showAllServices
              ? availableServices
              : availableServices.slice()
            ).map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-around px-2 py-1 text-gray-600 text-xs rounded-full border border-gray-300"
              >
                {String(service.service).replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>

        {/* owner info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {seller_info?.profile_image ? (
              <img
                src={seller_info.profile_image}
                alt={seller_info?.full_name || "Seller"}
                className="w-6 h-6 rounded-full object-cover border border-red-100"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-avatar.jpg";
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <User className="h-4 w-4 text-[#ff4956]" />
              </div>
            )}
            <span className="text-sm text-gray-700 font-medium">
              {seller_info?.full_name || "—"}
            </span>
          </div>

          <Link
            to={`/events/${slug}`}
            className="text-[#ff4956] hover:text-red-900 text-sm font-medium flex items-center gap-1"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
