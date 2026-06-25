import React from "react";
import { useSelector } from "react-redux";
import BuyerOrdersList from "@/components/orders/BuyerOrdersList";
import { Helmet } from "react-helmet-async";

export default function BuyerOrdersPage() {
  const { user } = useSelector((state) => state.user);
  const buyerSlug = user?.slug;

  return (
    <div className="container mx-auto p-2 md:p-6">
      <Helmet>
        <title>
          {user
            ? `${user.full_name} - All Order Page - Biya Kormu`
            : "All Orders - Biya Kormu"}
        </title>
      </Helmet>

      {buyerSlug ? (
        <BuyerOrdersList buyerSlug={buyerSlug} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
