import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBuyerOrders, updateOrder } from "@/redux/slices/orderSlice";
import OrderCard from "./OrderCard";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const BuyerOrdersList = ({ buyerSlug }) => {
  const dispatch = useDispatch();
  const { buyerOrders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (buyerSlug) {
      dispatch(fetchBuyerOrders({ buyerSlug }));
    }
  }, [buyerSlug, dispatch]);

  const handleRefresh = async () => {
    try {
      await dispatch(fetchBuyerOrders({ buyerSlug })).unwrap();
      toast.success("Orders refreshed");
    } catch (err) {
      toast.error(err);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await dispatch(
        updateOrder({
          buyerSlug,
          orderId,
          payload: { status: "cancelled" },
        })
      ).unwrap();
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(err.detail || err.message || "Failed to cancel order");
    }
  };

  const handleComplete = async (orderId) => {
    try {
      await dispatch(
        updateOrder({
          buyerSlug,
          orderId,
          payload: { status: "completed" },
        })
      ).unwrap();
      toast.success("Order marked as completed");
    } catch (err) {
      toast.error(err.detail || err.message || "Failed to complete order");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow border border-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-800 mb-3"></div>
        <p className="text-gray-600 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (!buyerOrders.length) {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-10 text-center">
        <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white  max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-3 px-4 sm:px-6 py-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-800">
          My Orders{" "}
          <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums bg-red-800">
            {buyerOrders.length}
          </Badge>{" "}
        </h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-2 md:px-6 text-xs md:text-sm bg-red-800 text-white rounded-md flex items-center gap-2 hover:bg-red-700 transition"
        >
          <RefreshCw className="h-3 w-3 md:w-4 md:h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="my-3 mx-4 sm:mx-6 bg-red-50 border border-red-200 p-3 text-center shadow-sm rounded">
          <p className="text-sm text-red-600">
            {error || "Something went wrong."}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <Accordion type="multiple" className="w-full">
          <div className="min-w-full text-sm">
            {/* Table Header (hidden on mobile) */}
            <div className="hidden md:grid grid-cols-6 bg-red-50 text-gray-600 font-medium border-b">
              <div className="px-6 py-3 text-left">Date</div>
              <div className="px-6 py-3 text-left">Seller</div>
              <div className="px-6 py-3 text-left">Contact</div>
              <div className="px-6 py-3 text-left">Status</div>
              <div className="px-6 py-3 text-left">Amount</div>
              <div className="px-6 py-3 text-left"></div>
            </div>

            {/* Orders */}
            <div className="w-full">
              {buyerOrders.map((order) => (
                <AccordionItem
                  key={order.id}
                  value={`order-${order.id}`}
                  className="border-b"
                >
                  {/* Accordion Trigger */}
                  <AccordionTrigger className="flex flex-col md:grid md:grid-cols-6 hover:bg-gray-50 cursor-pointer w-full px-4 sm:px-6 py-4 gap-3 md:gap-0 text-sm">
                    <>
                      {/* Date */}
                      <div className="text-gray-700">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>

                      {/* Seller */}
                      <div className="flex items-center gap-2">
                        <img
                          src={order.event_logo}
                          alt={order.seller_name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600">
                            {order.event_brand_name}
                          </span>
                          <span className="text-sm">{order.seller_name}</span>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="font-medium text-gray-900">
                        {order?.event_seller_whatsapp_number ||
                          order?.event_seller__number}
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : order.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : order.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : order.status === "cancelled"
                              ? "bg-gray-200 text-gray-700"
                              : order.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="font-medium text-gray-900">
                        <span className="text-2xl">৳ </span>{" "}
                        {order.total_amount || "0.00"}
                      </div>
                    </>
                  </AccordionTrigger>

                  {/* Accordion Content */}
                  <AccordionContent className="py-4 bg-gray-50 px-4 sm:px-6">
                    <OrderCard
                      user={user}
                      order={order}
                      onCancel={handleCancel}
                      onComplete={handleComplete}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </div>
        </Accordion>
      </div>
    </div>
  );
};

export default BuyerOrdersList;
