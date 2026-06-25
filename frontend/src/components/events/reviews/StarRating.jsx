import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRating({ value, size = 16, className }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center", className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-yellow-400 text-yellow-400"
          fill="currentColor"
        />
      ))}

      {hasHalfStar && (
        <StarHalf
          size={size}
          className="fill-yellow-400 text-yellow-400"
          fill="currentColor"
        />
      )}

      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-yellow-400" />
      ))}
    </div>
  );
}

export default StarRating;
