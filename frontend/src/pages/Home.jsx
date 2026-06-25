import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { fetchAllEvents } from "@/redux/slices/eventSlice";
import VideoHeroSection from "@/components/home/VideoHeroSection";
import FilterSection from "@/components/home/FolterSection";
import TopRatedEvents from "@/components/home/TopRatedEvents";

const Home = () => {
  const dispatch = useDispatch();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          page_size: 9,
          order_by: "-total_views",
        };

        const payload = await dispatch(fetchAllEvents(params)).unwrap();
        const newResults = payload?.results || payload || [];
        setEvents(newResults);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Biya Kormu</title>
        <meta
          name="description"
          content="Biya Kormu helps you discover the best event services for your special occasions. Find photographers, venues, caterers and more."
        />
      </Helmet>
      <VideoHeroSection />
      <FilterSection />
      <TopRatedEvents />
    </div>
  );
};

export default Home;
