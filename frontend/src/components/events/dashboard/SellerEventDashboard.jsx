import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchEventDashboard,
  selectEventDashboardBySlug,
} from "@/redux/slices/eventSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star, Eye, MessageSquare } from "lucide-react";

export default function SellerEventDashboard({ slug: propSlug }) {
  const params = useParams();
  const slug = propSlug ?? params.slug;
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) =>
    selectEventDashboardBySlug(state, slug || "")
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchEventDashboard(slug));
    }
  }, [slug, dispatch]);

  if (!slug) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No event selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard:{" "}
        {Array.isArray(error) ? error.join(", ") : error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No dashboard data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <p className="text-muted-foreground">{data.brand_name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" /> Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.total_views}</p>
            <p className="text-sm text-muted-foreground">
              Today: {data.today_views}
            </p>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.total_reviews}</p>
            <p className="text-sm text-muted-foreground">
              Daily Comments: {data.daily_comment_count}
            </p>
          </CardContent>
        </Card>

        {/* Ratings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" /> Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {data.average_rating?.toFixed?.(1) ?? "0.0"}
            </p>
            <p className="text-sm text-muted-foreground">
              Daily Avg: {data.daily_average_rating?.toFixed?.(1) ?? "0.0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.isArray(data.rating_distribution) &&
          data.rating_distribution.length > 0 ? (
            data.rating_distribution.map((bucket, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-8 text-sm font-medium">{bucket.rating}</span>
                <Progress
                  value={
                    data.total_reviews > 0
                      ? (bucket.count / data.total_reviews) * 100
                      : 0
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">
                  {bucket.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No ratings yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
