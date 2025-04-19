import {
    Star
} from "lucide-react";
import React from "react";

const StarRating = ({ rating, theme }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center" title={`${rating.toFixed(1)} out of 5 stars`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={14} className={`${theme.accent}`} fill="currentColor" />
      ))}
      {halfStar && (
        <Star
          key="half"
          size={14}
          className={`${theme.accent}`}
          fill="currentColor"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={14} className={`${theme.subText} opacity-50`} />
      ))}
      <span className={`ml-1.5 text-xs ${theme.subText}`}>({rating.toFixed(1)})</span>
    </div>
  );
};

export default React.memo(StarRating);
