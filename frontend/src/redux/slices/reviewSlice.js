import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axiosInstance";

// Helper functions
const calculateAverageRating = (reviews) => {
  if (!reviews || !reviews.length) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
};

const calculateRatingBreakdown = (reviews) => {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!reviews) return breakdown;

  reviews.forEach((review) => {
    const roundedRating = Math.round(review.rating);
    if (breakdown[roundedRating] !== undefined) {
      breakdown[roundedRating] += 1;
    }
  });
  return breakdown;
};

// Async thunks
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async ({ eventSlug, loadMore = false }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${eventSlug}/reviews/`);

      const reviewsArray = response.data;
      const transformedData = {
        results: reviewsArray,
        average: calculateAverageRating(reviewsArray),
        total: reviewsArray.length,
        breakdown: calculateRatingBreakdown(reviewsArray),
      };

      return {
        data: transformedData,
        loadMore,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch reviews");
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async ({ eventSlug, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/${eventSlug}/reviews/create/`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      if (error.fieldErrors || error.globalErrors) {
        const errorMessage =
          error.globalErrors.length > 0
            ? error.globalErrors[0]
            : Object.values(error.fieldErrors)[0] || "Failed to create review";
        console.log("reviews error data :", error);
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(error.response?.data || "Failed to create review");
    }
  }
);

export const editReview = createAsyncThunk(
  "reviews/editReview",
  async ({ eventSlug, id, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/events/${eventSlug}/reviews/${id}/edit/`,
        {
          rating,
          comment,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to edit review");
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async ({ eventSlug, id }, { rejectWithValue }) => {
    try {
      await api.delete(`/events/${eventSlug}/reviews/${id}/delete/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete review");
    }
  }
);

// Initial state
const initialState = {
  reviewsByEvent: {},
  currentEventSlug: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  errors: null,
  nextPage: null,
  hasMore: false,
};

// Review slice
const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = null;
    },
    resetReviewState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        const { data, loadMore } = action.payload;
        const eventSlug = action.meta.arg.eventSlug;

        if (!state.reviewsByEvent[eventSlug]) {
          state.reviewsByEvent[eventSlug] = {
            results: [],
            average: 0,
            total: 0,
            breakdown: {},
          };
        }

        if (loadMore) {
          // Append new reviews to existing ones
          state.reviewsByEvent[eventSlug].results = [
            ...state.reviewsByEvent[eventSlug].results,
            ...data.results,
          ];
        } else {
          // Replace reviews
          state.reviewsByEvent[eventSlug] = data;
        }

        // Recalculate statistics to ensure they're always correct
        state.reviewsByEvent[eventSlug].average = calculateAverageRating(
          state.reviewsByEvent[eventSlug].results
        );
        state.reviewsByEvent[eventSlug].total =
          state.reviewsByEvent[eventSlug].results.length;
        state.reviewsByEvent[eventSlug].breakdown = calculateRatingBreakdown(
          state.reviewsByEvent[eventSlug].results
        );

        state.nextPage = data.next ? (state.nextPage || 1) + 1 : null;
        state.hasMore = !!data.next;
        state.currentEventSlug = eventSlug;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.errors = action.payload;
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.errors = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.creating = false;
        const eventSlug = action.meta.arg.eventSlug;

        if (state.reviewsByEvent[eventSlug]) {
          state.reviewsByEvent[eventSlug].results.unshift(action.payload);
          state.reviewsByEvent[eventSlug].average = calculateAverageRating(
            state.reviewsByEvent[eventSlug].results
          );
          state.reviewsByEvent[eventSlug].total =
            state.reviewsByEvent[eventSlug].results.length;
          state.reviewsByEvent[eventSlug].breakdown = calculateRatingBreakdown(
            state.reviewsByEvent[eventSlug].results
          );
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.errors = action.payload;
      })
      // Edit review
      .addCase(editReview.pending, (state) => {
        state.updating = true;
        state.errors = null;
      })
      .addCase(editReview.fulfilled, (state, action) => {
        state.updating = false;
        const eventSlug = action.meta.arg.eventSlug;
        const updatedReview = action.payload;

        if (state.reviewsByEvent[eventSlug]) {
          const index = state.reviewsByEvent[eventSlug].results.findIndex(
            (review) => review.id === updatedReview.id
          );

          if (index !== -1) {
            state.reviewsByEvent[eventSlug].results[index] = updatedReview;
            state.reviewsByEvent[eventSlug].average = calculateAverageRating(
              state.reviewsByEvent[eventSlug].results
            );
            state.reviewsByEvent[eventSlug].breakdown =
              calculateRatingBreakdown(state.reviewsByEvent[eventSlug].results);
          }
        }
      })
      .addCase(editReview.rejected, (state, action) => {
        state.updating = false;
        state.errors = action.payload;
      })
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.deleting = true;
        state.errors = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleting = false;
        const eventSlug = action.meta.arg.eventSlug;
        const reviewId = action.payload;

        if (state.reviewsByEvent[eventSlug]) {
          state.reviewsByEvent[eventSlug].results = state.reviewsByEvent[
            eventSlug
          ].results.filter((review) => review.id !== reviewId);

          state.reviewsByEvent[eventSlug].average = calculateAverageRating(
            state.reviewsByEvent[eventSlug].results
          );
          state.reviewsByEvent[eventSlug].total =
            state.reviewsByEvent[eventSlug].results.length;
          state.reviewsByEvent[eventSlug].breakdown = calculateRatingBreakdown(
            state.reviewsByEvent[eventSlug].results
          );
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.errors = action.payload;
      });
  },
});

// Selectors
export const selectReviews = (state, eventSlug) =>
  state.reviews.reviewsByEvent[eventSlug] || {
    results: [],
    average: 0,
    total: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

export const selectReviewLoading = (state) => state.reviews.loading;
export const selectReviewCreating = (state) => state.reviews.creating;
export const selectReviewUpdating = (state) => state.reviews.updating;
export const selectReviewDeleting = (state) => state.reviews.deleting;
export const selectReviewErrors = (state) => state.reviews.errors;
export const selectHasMoreReviews = (state) => state.reviews.hasMore;

// Actions
export const { clearErrors, resetReviewState } = reviewSlice.actions;

// Reducer
export default reviewSlice.reducer;
