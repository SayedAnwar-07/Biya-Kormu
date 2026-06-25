import React from "react";
import { Eye, Star, MessageSquare } from "lucide-react";

// Stats display component
export function EventStats({ views = 0, reviews = 0, rating = "0.00" }) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
        <Eye className="h-5 w-5 mb-1 text-muted-foreground" />
        <span className="text-lg font-bold">{views}</span>
        <span className="text-xs text-muted-foreground">Views</span>
      </div>
      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
        <MessageSquare className="h-5 w-5 mb-1 text-muted-foreground" />
        <span className="text-lg font-bold">{reviews}</span>
        <span className="text-xs text-muted-foreground">Reviews</span>
      </div>
      <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
        <Star className="h-5 w-5 mb-1 text-yellow-500 fill-yellow-500" />
        <span className="text-lg font-bold">{rating}</span>
        <span className="text-xs text-muted-foreground">Rating</span>
      </div>
    </div>
  );
}

// Update your OwnerInfoCard component to include these stats
export default function OwnerInfoCard({ seller, brandName, stats }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={seller?.profile_image} />
            <AvatarFallback>
              {seller?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{brandName}</h3>
            <p className="text-sm text-muted-foreground">
              by {seller?.full_name}
            </p>
          </div>
        </div>

        {/* Add the stats component here */}
        <EventStats
          views={stats?.views || 0}
          reviews={stats?.reviews || 0}
          rating={stats?.avgRating || "0.00"}
        />

        <div className="space-y-2">
          <Button className="w-full" asChild>
            <Link to={`/profile/${seller?.profile_slug}`}>View Profile</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to={`/contact/${seller?.id}`}>Contact Seller</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
