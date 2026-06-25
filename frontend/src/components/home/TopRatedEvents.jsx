import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvents, selectAllEvents } from "@/redux/slices/eventSlice";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, ArrowRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/events/EventCard";
import { Link } from "react-router-dom";

const TopRatedEvents = () => {
  const dispatch = useDispatch();
  const { results: events = [], loading } = useSelector(selectAllEvents);
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    const queryParams = {
      order_by: "-average_rating",
    };
    dispatch(fetchAllEvents(queryParams));
  }, [dispatch]);

  // Create a shallow copy of the events array before sorting
  const topRatedEvents = [...events]
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, displayCount);

  if (loading && events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <h2 className="text-2xl font-light tracking-wide text-gray-800 dark:text-white">
              TOP RATED EVENTS
            </h2>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Curated Excellence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="flex mb-16 justify-between items-start">
        <div>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-2xl font-light tracking-wide text-gray-800 dark:text-white">
                TOP RATED EVENTS
              </h2>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">
            Community's Highest Rated Experiences
          </p>
        </div>

        {/* View All Link */}
        <Link
          to="/events"
          className="group inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border-b border-transparent hover:border-gray-300 pb-1"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            View All Events
          </span>

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Events Grid */}
      {topRatedEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 inline-flex mb-6">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            No Top Rated Events
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Highly-rated events will appear here as they receive community
            feedback.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topRatedEvents.map((event, index) => (
            <div key={event.id || event.slug} className="group relative">
              {/* Premium badge for top event */}
              {index === 0 && event.average_rating >= 4.5 && (
                <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                  PREMIUM
                </div>
              )}
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {/* Subtle divider */}
      <div className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800"></div>
    </div>
  );
};

export default TopRatedEvents;
