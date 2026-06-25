import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, clearError, clearMessage } from "@/redux/slices/userSlice";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Calendar,
  Shield,
  CircleCheckBig,
  MapPin,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import UserEvents from "@/components/profile/UserEvents";
import BackButton from "@/components/BackButton";
import { Helmet } from "react-helmet-async";
import SellerEventDashboard from "@/components/events/dashboard/SellerEventDashboard";

const ProfilePage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { user, loading, error, message } = useSelector((state) => state.user);

  useEffect(() => {
    if (slug) dispatch(getProfile(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (error) {
      const msg =
        error?.error ||
        error?.message ||
        (typeof error === "string" ? error : "Something went wrong");
      toast.error(msg);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  // loading skeleton
  if (loading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>
          {user
            ? `${user.full_name} Profiles - Biya Kormu`
            : "Profile Page - Biya Kormu"}
        </title>
        <meta
          name="description"
          content={user?.description || "View user profile on Biya Kormu"}
        />
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with back button */}
        <BackButton />

        {/* Profile Header Card */}
        <Card className="overflow-hidden pt-0">
          <div className="bg-gradient-to-r from-primary/10 to-muted/30 h-32 md:h-40 relative">
            <div className="absolute -bottom-16 left-6 md:left-8">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={user.profile_image} alt={user.full_name} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <CardHeader className="pt-20 pb-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">{user.full_name}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.accepted_terms && (
                  <Badge className="gap-1 py-1.5 px-3">
                    <CircleCheckBig className="h-4 w-4 text-green-500 font-bold" />
                    Accepted Terms
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {user.user_type}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-6">
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>

              {user.location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{user.location}</span>
                </div>
              )}

              {user.phone_number && (
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{user.phone_number}</span>
                </div>
              )}

              {user.whatsapp_number && (
                <div className="flex items-center text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{user.whatsapp_number}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section - Minimal Pill Style */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="events" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                  <TabsTrigger
                    value="events"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="px-6 pb-6">
                <TabsContent value="events" className="mt-6">
                  <UserEvents user={user} />
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <SellerEventDashboard
                    slug={user?.seller_created_events?.[0]?.slug}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
