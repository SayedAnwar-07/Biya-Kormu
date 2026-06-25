import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  ShoppingCart,
  Download,
  Printer,
  CreditCard,
  BadgePercent,
  Receipt,
  SquarePen, // ✅ new icon
  Save,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { sellerUpdateOrder } from "@/redux/slices/orderSlice";
import toast from "react-hot-toast";

const OrderCard = ({ order, onCancel, onComplete, onAccept, user }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [discount, setDiscount] = useState(order.discount_price || "");
  const [advance, setAdvance] = useState(order.advance_paid || "");
  const [fullDate, setFullDate] = useState(order.full_payment_date || "");

  const services = order?.selected_services?.map((s) =>
    typeof s === "string" ? s : s?.name
  );

  const calculateTotal = () => {
    if (order.total_amount) return Number(order.total_amount) || 0;
    if (order.selected_services && order.selected_services.length > 0) {
      return order.selected_services.reduce((total, service) => {
        return total + Number(service.price || 0);
      }, 0);
    }
    return 0;
  };

  const totalAmount = Number(calculateTotal()) || 0;
  const advancePaid = Number(order.advance_paid) || 0;
  const discountPrice = Number(order.discount_price) || 0;
  const balanceDue = totalAmount - advancePaid - discountPrice;

  const statusConfig = {
    pending: {
      color: "bg-amber-100 text-amber-800",
      icon: <Clock className="h-4 w-4" />,
      text: "Pending",
    },
    accepted: {
      color: "bg-indigo-100 text-indigo-800",
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Accepted",
    },
    cancelled: {
      color: "bg-rose-100 text-rose-800",
      icon: <XCircle className="h-4 w-4" />,
      text: "Cancelled",
    },
    completed: {
      color: "bg-emerald-100 text-emerald-800",
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Completed",
    },
  };

  const status = statusConfig[order.status] || statusConfig.pending;

  const handlePrint = () => {
    window.print();
  };

  const handleUpdate = async () => {
    try {
      await dispatch(
        sellerUpdateOrder({
          sellerSlug: order.seller_slug,
          orderId: order.id,
          payload: {
            discount_price: discount ? parseFloat(discount) : null,
            advance_paid: advance ? parseFloat(advance) : null,
            full_payment_date: fullDate || null,
          },
        })
      ).unwrap();

      toast.success("Order updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err || "Failed to update order");
    }
  };

  return (
    <div className="bg-white overflow-hidden invoice-card border border-gray-100 max-w-7xl mx-auto">
      {/* Invoice Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="">Order #{order.id}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color} backdrop-blur-sm`}
            >
              {status.icon}
              <span>{status.text}</span>
            </div>
            <p className=" text-sm">
              Created: {format(new Date(order.created_at), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Company and Client Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            From
          </h3>
          <div className="flex items-center gap-3 mb-3">
            {order?.event_logo && (
              <img
                src={order.event_logo}
                alt={order.event_brand_name || "Event Logo"}
                className="h-12 w-12 rounded-xl object-cover border border-gray-200"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {order.event_brand_name}
              </p>
              <p className="text-sm text-gray-600">{order.event_title}</p>
            </div>
          </div>
          {order.seller_name && (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              {order.seller_name}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Bill To
          </h3>
          <div className="bg-gray-50 p-4 rounded-xl">
            {order.buyer_name && (
              <p className="font-medium text-gray-900">{order.buyer_name}</p>
            )}
            {order.location && (
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {order.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-gray-50 p-5 border-y border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Event Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {order.event_date && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Event Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(order.event_date), "PPP")}
                </p>
              </div>
            </div>
          )}

          {order.event_time && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Event Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {order.event_time}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100">
            <div className="bg-purple-100 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Services</p>
              <p className="text-sm font-medium text-gray-900">
                {services?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="p-6">
        <div className=" border-gray-200 rounded-xl overflow-hidden">
          <div className="w-full">
            <div>
              <p className="flex justify-between font-semibold">
                <span className="text-left py-4 px-6 font-semibold text-gray-500 text-sm">
                  Service
                </span>
                <span className="text-right py-4 px-6 font-semibold text-gray-500 text-sm">
                  Price
                </span>
              </p>
            </div>

            <div>
              {order.selected_services &&
                order.selected_services.map((service) => (
                  <div className="bg-gray-50 flex justify-between mb-2">
                    <p className="py-4 px-6 text-sm text-gray-900">
                      {typeof service === "object" ? service.name : service}
                    </p>
                    <p className="py-4 px-6 text-sm text-gray-900 text-right">
                      ৳
                      {typeof service === "object"
                        ? service.price.toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Summary
          </h3>
          {user?.user_type === "seller" && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-indigo-600 hover:text-indigo-800"
              onClick={() => setIsEditing(true)}
            >
              <SquarePen className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>

        {!isEditing ? (
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ৳{Number(totalAmount).toFixed(2)}
                </span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <BadgePercent className="h-4 w-4 text-amber-600" />
                    Discount:
                  </span>
                  <span className="font-medium text-amber-600">
                    -৳{Number(discountPrice).toFixed(2)}
                  </span>
                </div>
              )}

              {advancePaid > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    Advance Paid:
                  </span>
                  <span className="font-medium text-green-600">
                    -৳{Number(advancePaid).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Balance Due:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ৳{Number(balanceDue).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-xs ml-auto">
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Discount Price"
            />
            <Input
              type="number"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              placeholder="Advance Paid"
            />
            <Input
              type="date"
              value={fullDate}
              onChange={(e) => setFullDate(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleUpdate}
              >
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 rounded-lg">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 rounded-lg"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Seller: Accept order */}
            {onAccept && order.status === "pending" && (
              <Button
                variant="default"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onAccept(order.id)}
              >
                Accept Order
              </Button>
            )}

            {/* Buyer: Cancel */}
            {onCancel &&
              (order.status === "pending" || order.status === "accepted") && (
                <Button
                  variant="outline"
                  className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                  onClick={() => onCancel(order.id)}
                >
                  Cancel Order
                </Button>
              )}

            {/* Buyer: Mark Complete */}
            {onComplete &&
              (order.status === "pending" || order.status === "accepted") && (
                <Button
                  variant="default"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onComplete(order.id)}
                >
                  Mark as Completed
                </Button>
              )}

            {/* Status messages */}
            {order.status === "completed" && (
              <span className="text-sm text-gray-500 italic">
                This order is completed
              </span>
            )}
            {order.status === "cancelled" && (
              <span className="text-sm text-gray-500 italic">
                This order is cancelled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
