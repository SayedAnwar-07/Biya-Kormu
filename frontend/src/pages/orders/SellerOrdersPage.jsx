import React from "react";
import { useSelector } from "react-redux";
import SellerOrdersList from "@/components/orders/SellerOrdersList";
import { Helmet } from "react-helmet-async";

export default function SellerOrdersPage() {
  const { user } = useSelector((state) => state.user);
  const sellerSlug = user?.slug;

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-6">
      {/* <Helmet>
        <title>
          {user
            ? `${user?.full_name} - All Order Page - Biya Kormu`
            : "All Orders - Biya Kormu"}
        </title>
      </Helmet> */}

      {sellerSlug ? (
        <SellerOrdersList sellerSlug={sellerSlug} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
