import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDispatch } from "react-redux";
import { sellerUpdateOrder } from "@/redux/slices/orderSlice";
import toast from "react-hot-toast";

const SellerUpdateDialog = ({ sellerSlug, order }) => {
  const [discount, setDiscount] = useState(order.discount_price || "");
  const [advance, setAdvance] = useState(order.advance_paid || "");
  const [fullDate, setFullDate] = useState(order.full_payment_date || "");
  const dispatch = useDispatch();

  const handleUpdate = async () => {
    try {
      await dispatch(
        sellerUpdateOrder({
          sellerSlug,
          orderId: order.id,
          payload: {
            discount_price: discount ? parseFloat(discount) : null,
            advance_paid: advance ? parseFloat(advance) : null,
            full_payment_date: fullDate || null,
          },
        })
      ).unwrap();
      toast.success("Order updated successfully");
    } catch (err) {
      toast.error(err.detail || "Failed to update order");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
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
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleUpdate}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerUpdateDialog;
