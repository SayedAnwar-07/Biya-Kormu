import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "@/redux/slices/orderSlice";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";

const OrderCreateForm = ({
  buyerSlug,
  eventSlug,
  onSuccess,
  sellerName,
  sellerWhatsapp,
  brandName,
  brandlogo,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.orders);
  // const { user } = useSelector((state) => state.user);

  const [eventData, setEventData] = useState(null);
  const [formData, setFormData] = useState({
    event_date: "",
    event_time: "",
    location: "",
    selected_services: [],
  });

  // Fetch event data including services
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventSlug}/`);
        setEventData(res.data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
        toast.error("Failed to load event data");
      }
    };
    fetchEvent();
  }, [eventSlug]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const updated = checked
          ? [...prev.selected_services, value]
          : prev.selected_services.filter((s) => s !== value);
        return { ...prev, selected_services: updated };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle service selection by clicking the card
  const handleServiceSelect = (service) => {
    const updated = formData.selected_services.includes(service)
      ? formData.selected_services.filter((s) => s !== service)
      : [...formData.selected_services, service];
    setFormData((prev) => ({
      ...prev,
      selected_services: updated,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selected_services.length) {
      toast.error("Select at least one service");
      return;
    }

    try {
      // Backend expects event_id (numeric), get from eventData
      const payload = {
        ...formData,
        event_id: eventData.id,
      };

      const result = await dispatch(
        createOrder({ buyerSlug, payload })
      ).unwrap();

      toast.success("Order created successfully");

      // Reset form
      setFormData({
        event_date: "",
        event_time: "",
        location: "",
        selected_services: [],
      });

      if (onSuccess) onSuccess(result);
      else navigate(`/users/${buyerSlug}/orders`);
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error(err.detail || err.message || "Failed to create order");
    }
  };

  if (!eventData)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );

  return (
    <div className="overflow-hidden my-8 ">
      <div className="max-w-7xl mx-auto">
        {/* 2 Header with event info */}
        <div className="flex gap-4 mb-8">
          <div>
            <img src={brandlogo} alt="" className="h-16 w-16 rounded-full" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{sellerName}</h3>
            <span className="text-gray-600 text-sm">{brandName}</span>
            <p className="text-sm">{sellerWhatsapp}</p>
          </div>
        </div>

        <div className="w-full ">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">
                Event Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-1 outline-none focus:ring-red-600 focus:border-red-600 transition"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Event Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-1 outline-none focus:ring-red-600 focus:border-red-600 transition"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-1 outline-none focus:ring-red-600 focus:border-red-600 transition"
                  required
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            {/* Services Section */}
            <div className="relative py-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 border-b border-red-100">
                Select Services
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Choose the services you need for your special day
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventData.service_details
                  .filter((s) => s.is_available)
                  .map((service) => (
                    <div
                      key={service.service}
                      className={`border rounded-xl p-4 sm:p-5 transition-all cursor-pointer relative overflow-hidden mb-3 ${
                        formData.selected_services.includes(service.service)
                          ? "border-red-800 bg-red-50 ring-2 ring-red-800"
                          : "border-red-200 hover:border-red-400 hover:bg-gray-50"
                      }`}
                      onClick={() => handleServiceSelect(service.service)}
                    >
                      {/* Decorative corner elements */}
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 overflow-hidden">
                        <div
                          className={`absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 ${
                            formData.selected_services.includes(service.service)
                              ? "bg-red-800"
                              : "bg-red-200"
                          } opacity-20 transform rotate-45 translate-x-8 -translate-y-8`}
                        ></div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div>
                          <div className="flex flex-row gap-2">
                            <div
                              className={`flex items-center justify-center h-4 w-4 sm:h-6 sm:w-6 rounded-full border-2 mt-1 sm:mt-0 ${
                                formData.selected_services.includes(
                                  service.service
                                )
                                  ? "bg-red-800 border-red-800"
                                  : "bg-white border-red-300"
                              }`}
                            >
                              {formData.selected_services.includes(
                                service.service
                              ) && (
                                <svg
                                  className="h-3 w-3 sm:h-3 sm:w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 capitalize text-md sm:text-lg">
                                {service.service.replace(/_/g, " ")}
                              </h4>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {service.short_description}
                          </p>
                        </div>

                        <span className="font-semibold text-red-800 text-sm sm:text-lg">
                          {parseFloat(service.price).toLocaleString()} BDT
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 w-full">
              <div className="w-full">
                {" "}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border-red-200 text-gray-700 hover:bg-gray-100 w-full"
                >
                  Cancel
                </Button>
              </div>
              <div className="w-full">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white w-full"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderCreateForm;
