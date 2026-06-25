import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axiosInstance";

// Create a new event
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/events/create/", payload);
      return data;
    } catch (err) {
      // err is already normalized by axios interceptor
      return rejectWithValue(err);
    }
  }
);

// Fetch single event by slug
export const fetchEvent = createAsyncThunk(
  "events/fetchEvent",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/events/${slug}/`);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Fetch all events with optional filtering
export const fetchAllEvents = createAsyncThunk(
  "events/fetchAllEvents",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      // Handle multiple parameters with same name
      let url = "/events/";

      if (typeof queryParams === "string") {
        // If it's already a query string, append it directly
        url += `?${queryParams}`;
        const { data } = await api.get(url);
        return data;
      } else {
        // Handle object with multiple values for same key
        const params = new URLSearchParams();

        Object.keys(queryParams).forEach((key) => {
          if (key === "getAll" && typeof queryParams[key] === "function") {
            // Special handling for getAll function
            const values = queryParams.getAll("service_type");
            values.forEach((value) => {
              params.append("service_type", value);
            });
          } else if (Array.isArray(queryParams[key])) {
            // Handle arrays by appending each value
            queryParams[key].forEach((value) => {
              params.append(key, value);
            });
          } else {
            params.append(key, queryParams[key]);
          }
        });

        const { data } = await api.get(url, { params });
        return data;
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Get search suggestions
export const fetchSearchSuggestions = createAsyncThunk(
  "events/fetchSearchSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/events/suggestions/", {
        params: { q: query },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Update event by slug (PATCH)
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ slug, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/events/${slug}/update/`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Delete event by slug
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (slug, { rejectWithValue }) => {
    try {
      await api.delete(`/events/${slug}/delete/`);
      return { slug };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Global dashboard (aggregated across all events)
export const fetchGlobalDashboard = createAsyncThunk(
  "events/fetchGlobalDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/events/dashboard/");
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Single event dashboard by slug
export const fetchEventDashboard = createAsyncThunk(
  "events/fetchEventDashboard",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/events/${slug}/dashboard/`);
      return { slug, data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  bySlug: {},
  allEvents: {
    results: [],
    count: 0,
    loading: false,
    error: null,
    suggestions: {},
    suggestionsLoading: false,
  },
  currentSlug: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  dashboards: {
    global: { data: null, loading: false, error: null },
    bySlug: {},
  },
  error: null,
  fieldErrors: {},
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setCurrentSlug(state, action) {
      state.currentSlug = action.payload || null;
    },
    clearEventErrors(state) {
      state.error = null;
      state.fieldErrors = {};
    },
    clearAllEvents(state) {
      state.allEvents = {
        results: [],
        count: 0,
        loading: false,
        error: null,
        suggestions: {},
      };
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createEvent.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.creating = false;
        const ev = action.payload;
        state.bySlug[ev.slug] = ev;
        state.currentSlug = ev.slug;
        state.allEvents.results = [ev, ...state.allEvents.results];
        state.allEvents.count += 1;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.globalErrors || [
          "Failed to create event",
        ];
        state.fieldErrors = action.payload?.fieldErrors || {};
      });

    // Fetch single
    builder
      .addCase(fetchEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading = false;
        const ev = action.payload;
        state.bySlug[ev.slug] = ev;
        state.currentSlug = ev.slug;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.globalErrors || ["Failed to load event"];
      });

    // Fetch all events
    builder
      .addCase(fetchAllEvents.pending, (state) => {
        state.allEvents.loading = true;
        state.allEvents.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.allEvents.loading = false;
        state.allEvents.results = action.payload.results || action.payload;
        state.allEvents.count = action.payload.count || action.payload.length;
        state.allEvents.suggestions = action.payload.suggestions || {};

        const events = action.payload.results || action.payload;
        events.forEach((event) => {
          if (event.slug) state.bySlug[event.slug] = event;
        });
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.allEvents.loading = false;
        state.allEvents.error = action.payload?.globalErrors || [
          "Failed to load events",
        ];
      });

    // Search suggestions
    builder
      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.allEvents.suggestionsLoading = true;
        state.allEvents.suggestions = {};
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.allEvents.suggestionsLoading = false;
        state.allEvents.suggestions = action.payload.suggestions || {};
      })
      .addCase(fetchSearchSuggestions.rejected, (state) => {
        state.allEvents.suggestionsLoading = false;
        state.allEvents.suggestions = {};
      });

    // Update
    builder
      .addCase(updateEvent.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.updating = false;
        const ev = action.payload;
        state.bySlug[ev.slug] = ev;
        state.currentSlug = ev.slug;

        const index = state.allEvents.results.findIndex(
          (event) => event.slug === ev.slug
        );
        if (index !== -1) {
          state.allEvents.results[index] = ev;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.globalErrors || [
          "Failed to update event",
        ];
        state.fieldErrors = action.payload?.fieldErrors || {};
      });

    // Delete
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.deleting = false;
        const slug = action.payload.slug;
        if (slug && state.bySlug[slug]) delete state.bySlug[slug];
        if (state.currentSlug === slug) state.currentSlug = null;

        state.allEvents.results = state.allEvents.results.filter(
          (event) => event.slug !== slug
        );
        state.allEvents.count = Math.max(0, state.allEvents.count - 1);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.globalErrors || [
          "Failed to delete event",
        ];
      });

    // Global dashboard
    builder
      .addCase(fetchGlobalDashboard.pending, (state) => {
        state.dashboards.global.loading = true;
        state.dashboards.global.error = null;
      })
      .addCase(fetchGlobalDashboard.fulfilled, (state, action) => {
        state.dashboards.global.loading = false;
        state.dashboards.global.data = action.payload;
      })
      .addCase(fetchGlobalDashboard.rejected, (state, action) => {
        state.dashboards.global.loading = false;
        state.dashboards.global.error = action.payload?.globalErrors || [
          "Failed to load dashboard",
        ];
      });

    // Event dashboard
    builder
      .addCase(fetchEventDashboard.pending, (state, action) => {
        const slug = action.meta.arg;
        if (!state.dashboards.bySlug[slug]) {
          state.dashboards.bySlug[slug] = {
            data: null,
            loading: false,
            error: null,
          };
        }
        state.dashboards.bySlug[slug].loading = true;
        state.dashboards.bySlug[slug].error = null;
      })
      .addCase(fetchEventDashboard.fulfilled, (state, action) => {
        const { slug, data } = action.payload;
        state.dashboards.bySlug[slug] = {
          data,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchEventDashboard.rejected, (state, action) => {
        const slug = action.meta.arg;
        if (!state.dashboards.bySlug[slug]) {
          state.dashboards.bySlug[slug] = {
            data: null,
            loading: false,
            error: null,
          };
        }
        state.dashboards.bySlug[slug].loading = false;
        state.dashboards.bySlug[slug].error = action.payload?.globalErrors || [
          "Failed to load event dashboard",
        ];
      });
  },
});

export const selectCurrentSlug = (state) => state.events.currentSlug;
export const selectEventBySlug = (state, slug) =>
  state.events.bySlug[slug] || null;
export const selectCurrentEvent = (state) =>
  state.events.currentSlug
    ? state.events.bySlug[state.events.currentSlug]
    : null;

export const selectAllEvents = (state) => state.events.allEvents;
export const selectEventLoading = (state) => state.events.loading;
export const selectEventCreating = (state) => state.events.creating;
export const selectEventUpdating = (state) => state.events.updating;
export const selectEventDeleting = (state) => state.events.deleting;

export const selectGlobalDashboard = (state) => state.events.dashboards.global;
export const selectEventDashboardBySlug = (state, slug) =>
  state.events.dashboards.bySlug[slug] || {
    data: null,
    loading: false,
    error: null,
  };

export const selectEventErrors = (state) => ({
  error: state.events.error,
  fieldErrors: state.events.fieldErrors,
});

export const { setCurrentSlug, clearEventErrors, clearAllEvents } =
  eventSlice.actions;
export default eventSlice.reducer;
