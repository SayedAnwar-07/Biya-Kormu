import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bumpWhatsappClick } from "@/redux/slices/userSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Eye,
  Star,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from "lucide-react";

export default function OwnerInfoCard({ seller, brandName, stats, createdAt }) {
  const dispatch = useDispatch();
  const [showDetails, setShowDetails] = useState(false);
  const sellerSlug =
    seller?.slug ??
    [
      (seller?.first_name || "").trim().toLowerCase(),
      (seller?.last_name || "").trim().toLowerCase(),
    ]
      .filter(Boolean)
      .join("-");

  const initials =
    seller?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      ?.slice(0, 2) ?? "U";

  const handleBump = useCallback(() => {
    if (!sellerSlug) return;
    dispatch(bumpWhatsappClick(sellerSlug));
  }, [dispatch, sellerSlug]);

  const waNumberRaw = seller?.whatsapp_number || "";
  const waNumber = waNumberRaw.replace(/\D/g, "");
  const waHref = waNumber ? `https://wa.me/${waNumber}` : undefined;

  // Calculate view growth percentage
  const dailyViews = seller?.seller_created_events?.[0]?.daily_views || {};
  const viewValues = Object.values(dailyViews);
  const viewGrowth =
    viewValues.length > 1
      ? (
          ((viewValues[viewValues.length - 1] - viewValues[0]) /
            viewValues[0]) *
          100
        ).toFixed(0)
      : 0;

  return (
    <Card className="sticky top-24 h-fit rounded-2xl border shadow-lg overflow-hidden pt-0 gap-2">
      <CardHeader className="space-y-3 pb-4 bg-gradient-to-br from-slate-50 to-slate-100 pt-8">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 border-white shadow-md">
            <AvatarImage src={seller?.profile_image} alt={seller?.full_name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg font-semibold text-gray-800">
              {seller?.full_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              Owner of {brandName}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat
            icon={<Eye className="h-4 w-4" />}
            label="Views"
            value={stats?.views ?? 0}
            growth={viewGrowth}
          />
          <Stat
            icon={<Star className="h-4 w-4" />}
            label="Rating"
            value={stats?.avgRating ?? "-"}
            isRating={true}
          />
          <Stat
            icon={<MessageCircle className="h-4 w-4" />}
            label="Reviews"
            value={stats?.reviews ?? 0}
            small
          />
        </div>

        <Separator className="my-2" />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Response rate</span>
            <span className="font-medium text-green-600">Within hours</span>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" /> Contact Information
          </h4>

          <a
            href={`mailto:${seller?.email}`}
            className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm">{seller?.email}</span>
          </a>

          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={handleBump}
            >
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <img
                  src="https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png"
                  alt="WhatsApp"
                  className="h-4 w-4 opacity-90"
                />
              </div>
              <span className="text-sm">{seller?.whatsapp_number}</span>
            </a>
          )}

          {seller?.phone_number && (
            <div className="flex items-center gap-2 text-sm p-2 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Phone className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm">{seller?.phone_number}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-between"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Performance details</span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showDetails && (
          <div className="space-y-4 pt-2 border-t">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> View trend (last 7
                  days)
                </span>
                <span className="font-medium">{stats?.views} total</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (stats?.views / 100) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-slate-50 rounded-lg">
                <div className="text-muted-foreground">WhatsApp clicks</div>
                <div className="font-semibold text-lg">
                  {seller?.whatsapp_click_count || 0}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <div className="text-muted-foreground">Today's clicks</div>
                <div className="font-semibold text-lg">
                  {seller?.whatsapp_daily_click_count || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {waHref && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                handleBump();
                window.open(waHref, "_blank");
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <img
                  src="https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png"
                  alt="WhatsApp"
                  className="h-4 w-4 opacity-90"
                />
                WhatsApp
              </div>
            </Button>
          )}
          <Button variant="outline" className="flex-1">
            <Phone className="h-4 w-4 mr-2" /> Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value, growth, isRating = false, small }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 border">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div
        className={`font-semibold text-center ${
          small ? "text-sm" : "text-lg"
        } ${isRating ? "text-amber-600" : "text-gray-800"}`}
      >
        {isRating && value !== "-" ? `${value}/5` : value}
      </div>
      {growth !== undefined && growth !== 0 && (
        <div
          className={`text-xs text-center mt-1 ${
            growth > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {growth > 0 ? "+" : ""}
          {growth}%
        </div>
      )}
    </div>
  );
}
