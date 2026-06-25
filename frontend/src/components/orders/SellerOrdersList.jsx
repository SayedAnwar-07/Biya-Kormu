import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSellerOrders, acceptOrder } from "@/redux/slices/orderSlice";
import OrderCard from "./OrderCard";
import toast from "react-hot-toast";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const SellerOrdersList = ({ sellerSlug }) => {
  const dispatch = useDispatch();
  const { sellerOrders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (sellerSlug) {
      dispatch(fetchSellerOrders({ sellerSlug }));
    }
  }, [sellerSlug, dispatch]);

  const handleRefresh = async () => {
    try {
      await dispatch(fetchSellerOrders({ sellerSlug })).unwrap();
      toast.success("Orders refreshed");
    } catch (err) {
      toast.error(err);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await dispatch(
        acceptOrder({ sellerSlug, orderId, payload: { seller_agreed: true } })
      ).unwrap();
      toast.success("Order accepted successfully");
    } catch (err) {
      toast.error(err);
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

  if (!sellerOrders.length) {
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
    <div className="bg-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 sm:px-6 py-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-800">
          All Orders{" "}
          <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums bg-red-800">
            {sellerOrders.length}
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
            <div className="hidden md:grid grid-cols-7 bg-red-50 text-gray-600 font-medium border-b">
              <div className="px-6 py-3 text-left">Date</div>
              <div className="px-6 py-3 text-left">Order #</div>
              <div className="px-6 py-3 text-left">Client</div>
              <div className="px-6 py-3 text-left">Status</div>
              <div className="px-6 py-3 text-left">Amount</div>
              <div className="px-6 py-3 text-left">Actions</div>
              <div className="px-6 py-3 text-left"></div>
            </div>

            {/* Orders */}
            <div className="w-full">
              {sellerOrders.map((order) => (
                <AccordionItem
                  key={order.id}
                  value={`order-${order.id}`}
                  className="border-b"
                >
                  {/* Accordion Trigger */}
                  <AccordionTrigger className="flex flex-col md:grid md:grid-cols-7 hover:bg-gray-50 cursor-pointer w-full px-4 sm:px-6 py-4 gap-3 md:gap-0 text-sm">
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

                      {/* Order ID */}
                      <div className="font-medium text-gray-900">
                        #{order.id}
                      </div>

                      {/* Client */}
                      <div className="flex items-center gap-2">
                        <img
                          src={order.buyer_profile}
                          alt={order.buyer_name}
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="text-xs">{order.buyer_name}</span>
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

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-100"
                              title="Reject"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button variant="destructive">Delete</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  </AccordionTrigger>

                  {/* Accordion Content */}
                  <AccordionContent className="px-4 sm:px-6 py-4 bg-gray-50">
                    <OrderCard
                      user={user}
                      order={order}
                      onAccept={handleAccept}
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

export default SellerOrdersList;
