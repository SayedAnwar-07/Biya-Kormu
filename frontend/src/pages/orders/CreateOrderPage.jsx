import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import OrderCreateForm from "@/components/orders/OrderCreateForm";
import { Helmet } from "react-helmet-async";
import { selectEventBySlug } from "@/redux/slices/eventSlice";

export default function CreateOrderPage() {
  const { slug } = useParams();
  const item = useSelector((state) => selectEventBySlug(state, slug));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const buyerSlug = user?.slug;

  const { sellerName, sellerWhatsapp, brandName, brandlogo } =
    location.state || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated || !buyerSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {(item?.brand_name || "Event") + " - Create Order - Biya Kormu"}
        </title>
        <meta
          name="description"
          content="Create a new event order with our services"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <OrderCreateForm
            sellerName={sellerName}
            sellerWhatsapp={sellerWhatsapp}
            brandName={brandName}
            brandlogo={brandlogo}
            buyerSlug={buyerSlug}
            eventSlug={slug}
            onSuccess={() => navigate(`/user/${buyerSlug}/orders`)}
          />
        </div>
      </div>
    </>
  );
}
