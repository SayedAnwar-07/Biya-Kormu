import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { editReview, clearErrors } from "@/redux/slices/reviewSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

function EditReviewForm({ eventSlug, review, onCancel, onSubmitSuccess }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const error = useSelector((state) => state.reviews.errors);

  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    dispatch(clearErrors());
    setFormErrors({});

    if (review) {
      setFormData({
        rating: Number(review.rating) || 0,
        comment: review.comment || "",
      });
    }
  }, [review, dispatch]);

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
    if (formErrors.rating) {
      setFormErrors((prev) => ({ ...prev, rating: null }));
    }
  };

  const handleCommentChange = (e) => {
    setFormData((prev) => ({ ...prev, comment: e.target.value }));
    if (formErrors.comment) {
      setFormErrors((prev) => ({ ...prev, comment: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.rating === 0) {
      errors.rating = "Please select a rating";
    }

    if (!formData.comment.trim()) {
      errors.comment = "Please write a review";
    } else if (formData.comment.trim().length < 2) {
      errors.comment = "Review must be at least 2 characters long";
    } else if (formData.comment.length > 1000) {
      errors.comment = "Review cannot exceed 1000 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    dispatch(clearErrors());

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await dispatch(
        editReview({
          eventSlug,
          id: review.id,
          rating: formData.rating,
          comment: formData.comment.trim(),
        })
      ).unwrap();

      onSubmitSuccess();
    } catch (err) {
      console.error("Detailed review submission error:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update review";

      setFormErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Edit Your Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/15 rounded-md">
              {typeof error === "object" ? JSON.stringify(error) : error}
            </div>
          )}

          {formErrors.submit && (
            <div className="p-3 text-sm text-destructive bg-destructive/15 rounded-md">
              {formErrors.submit}
            </div>
          )}

          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {currentUser.first_name?.charAt(0) ||
                    currentUser.email?.charAt(0) ||
                    "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {currentUser.first_name || currentUser.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your review will be public
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rating">Your Rating</Label>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    disabled={loading}
                  >
                    <Star
                      size={24}
                      className={
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.rating > 0 ? `${formData.rating}/5` : "Select rating"}
              </span>
            </div>
            {formErrors.rating && (
              <p className="text-sm text-destructive">{formErrors.rating}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Share details of your experience at this event..."
              value={formData.comment}
              onChange={handleCommentChange}
              rows={4}
              disabled={loading}
              className={formErrors.comment ? "border-destructive" : ""}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {formData.comment.length}/1000 characters
              </p>
              {formErrors.comment && (
                <p className="text-sm text-destructive">{formErrors.comment}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                loading || formData.rating === 0 || !formData.comment.trim()
              }
            >
              {loading ? "Updating..." : "Update Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditReviewForm;
