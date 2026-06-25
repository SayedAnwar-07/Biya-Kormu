import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchReviews,
  selectReviews,
  deleteReview,
  selectReviewLoading,
} from "@/redux/slices/reviewSlice";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateReviewForm from "./CreateReviewForm";
import EditReviewForm from "./EditReviewForm";
import StarRating from "./StarRating";

function RatingBar({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 text-sm tabular-nums text-muted-foreground">
        {label}
      </div>
      <Progress value={pct} className="h-2 flex-1" />
      <div className="w-12 text-right text-xs tabular-nums text-muted-foreground">
        {pct}%
      </div>
    </div>
  );
}

export default function Reviews({ eventSlug }) {
  const dispatch = useDispatch();
  const reviewsData = useSelector((state) => selectReviews(state, eventSlug));
  const loading = useSelector(selectReviewLoading);
  const currentUser = useSelector(selectCurrentUser);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (eventSlug) {
      dispatch(fetchReviews({ eventSlug }));
    }
  }, [dispatch, eventSlug]);

  const totalReviews = reviewsData?.total || 0;
  const totalPercent = reviewsData?.breakdown
    ? Object.values(reviewsData.breakdown).reduce((a, b) => a + b, 0)
    : 0;

  if (loading && !reviewsData?.results) {
    return (
      <div className="mx-auto w-full container sm:p-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!reviewsData) {
    return (
      <div className="mx-auto w-full container sm:p-6">
        <div className="flex justify-center items-center h-64">
          <p>No reviews data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full container sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ratings & Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Verified ratings from people who attended this event
          </p>
        </div>

        {currentUser && !showCreateForm && !editingReview && (
          <Button onClick={() => setShowCreateForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1">
        {currentUser && showCreateForm && (
          <CreateReviewForm
            eventSlug={eventSlug}
            onCancel={() => setShowCreateForm(false)}
            onSubmitSuccess={() => {
              setShowCreateForm(false);
              dispatch(fetchReviews({ eventSlug }));
            }}
          />
        )}

        {editingReview && (
          <EditReviewForm
            eventSlug={eventSlug}
            review={editingReview}
            onCancel={() => setEditingReview(null)}
            onSubmitSuccess={() => {
              setEditingReview(null);
              dispatch(fetchReviews({ eventSlug }));
            }}
          />
        )}

        {reviewsData.average > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Overall rating
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-bold leading-none tracking-tight">
                    {reviewsData.average.toFixed(1)}
                  </div>
                  <div className="-mt-1">
                    <StarRating
                      value={Math.round(reviewsData.average)}
                      size={20}
                    />
                    <div className="text-xs text-muted-foreground">
                      {totalReviews.toLocaleString()} reviews
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {reviewsData.breakdown &&
                Object.keys(reviewsData.breakdown).length > 0 && (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <RatingBar
                        key={n}
                        label={n}
                        value={reviewsData.breakdown[n] || 0}
                        total={totalPercent}
                      />
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {reviewsData.results && reviewsData.results.length > 0 ? (
            <>
              {reviewsData.results.map((r) => (
                <Card key={r.id} className="border-muted/60 gap-1">
                  <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={r.user_profile_image ?? undefined}
                          alt={r.user_full_name || "User"}
                        />
                        <AvatarFallback>
                          {(r.user_full_name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-medium leading-none">
                              {r.user_full_name || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span>
                            <StarRating value={r.rating} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {r.title && <h4 className="font-medium mb-2">{r.title}</h4>}
                    <p className="text-sm leading-6">{r.comment || r.body}</p>

                    {r.can_edit && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingReview(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            dispatch(
                              deleteReview({ eventSlug, id: r.id })
                            ).unwrap();
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="flex justify-center items-center h-32">
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to review!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
