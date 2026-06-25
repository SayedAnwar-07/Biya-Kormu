import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryImage from "@/components/events/GalleryImage";
import OwnerInfoCard from "@/components/events/OwnerInfoCard";
import { Button } from "@/components/ui/button";

import {
  Camera,
  Video,
  Building,
  Volume2,
  Lightbulb,
  ChefHat,
  Utensils,
  HelpCircle,
  ShoppingCart,
  Pencil,
} from "lucide-react";
import { useSelector } from "react-redux";
import Reviews from "@/components/events/reviews/Reviews";
import ReportButton from "@/components/events/reports/ReportButton";

const SERVICE_ICONS = {
  photography: Camera,
  videography: Video,
  hall_booking: Building,
  sound_system: Volume2,
  lighting: Lightbulb,
  chef_booking: ChefHat,
  catering: Utensils,
};

const getServiceIcon = (serviceKey) => {
  const IconComponent = SERVICE_ICONS[serviceKey] || HelpCircle;
  return <IconComponent className="h-5 w-5" />;
};

export default function DetailsPage({ item, isLoading = false }) {
  const { user } = useSelector((s) => s.user || {});
  const [reviewsReady, setReviewsReady] = useState(false);

  const isOwner = Boolean(
    user && item?.seller_info && user.id === item.seller_info.id
  );

  const current = item?.title || "Service Details";

  useEffect(() => {
    if (item?.slug) {
      setReviewsReady(true);
    }
  }, [item]);

  if (isLoading) {
    return <DetailsPageSkeleton />;
  }

  if (!item) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The service you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/events" className="text-primary hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Breadcrumbs current={current} />

      <div className="flex justify-end gap-2">
        {isOwner && (
          <Link to={`/events/${item?.slug || item?.id}/edit`}>
            <Button size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}

        {!isOwner && (
          <Link
            to={`/events/${item?.slug || item?.id}/order/create`}
            state={{
              sellerName: item?.seller_info?.full_name,
              sellerWhatsapp: item?.seller_info?.whatsapp_number,
              brandName: item?.brand_name,
              brandlogo: item?.logo,
            }}
          >
            <Button
              size="sm"
              className="bg-red-800 hover:bg-red-900 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </Link>
        )}

        <ReportButton event={item} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Gallery */}
        <div className="lg:col-span-2">
          <GalleryImage images={item?.gallery_images || []} />
        </div>

        {/* Right column - Owner info */}
        <div className="lg:col-span-1">
          <OwnerInfoCard
            seller={item?.seller_info}
            brandName={item?.brand_name}
            createdAt={item?.created_at}
            stats={{
              views: item?.total_views || 0,
              avgRating: item?.average_rating || "0.00",
              reviews: item?.total_reviews || 0,
            }}
          />
        </div>
      </div>

      {/* Description section */}
      {item?.description && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Description</h2>
          <Card className="rounded-2xl border-none shadow-none px-0">
            <CardContent className="px-0">
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service details section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Service Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {item?.service_details?.map((service, index) => {
            const serviceKey = service.service;
            return (
              <Card key={index} className="rounded-2xl gap-2 py-4">
                <CardContent className="">
                  {/* Icon and title row */}
                  <div className="flex items-center gap-2 mb-2">
                    {getServiceIcon(serviceKey)}
                    <h3 className="font-semibold text-lg capitalize">
                      {service.service.replace(/_/g, " ")}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {service.short_description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-medium ${
                        service.is_available ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {service.is_available ? "Available" : "Not Available"}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      <span className="font-bold text-2xl">৳ </span>
                      {service.price || "0.00"}{" "}
                    </span>
                  </div>
                </CardContent>
                <hr className="w-[90%] mx-auto" />
                <CardFooter>
                  <p className="text-sm font-medium text-primary">
                    Contact us for the best price offer and feel free to
                    negotiate on pricing.
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-8">
        {reviewsReady && <Reviews eventSlug={item.slug} />}
      </div>
    </div>
  );
}

function DetailsPageSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery Skeleton */}
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>

        {/* Owner Info Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>

      {/* Service Details Skeleton */}
      <div className="mt-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Reviews Skeleton */}
      <div className="mt-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ current }) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/events">Events</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ReviewsList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No reviews yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <Card key={r.id} className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={r.user_profile_image} />
                <AvatarFallback>
                  {r.user_full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    ?.slice(0, 2) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <div className="font-medium">{r.user_full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(r.created_at)}
                  </div>
                  <div className="ml-auto text-sm font-semibold">
                    ⭐ {r.rating}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.comment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}
