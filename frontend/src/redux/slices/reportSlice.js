import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axiosInstance";

// Async thunks
export const fetchEventReports = createAsyncThunk(
  "reports/fetchEventReports",
  async (eventSlug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${eventSlug}/reports/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  "reports/fetchUserReports",
  async (userSlug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${userSlug}/reports/all/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReport = createAsyncThunk(
  "reports/fetchReport",
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createReport = createAsyncThunk(
  "reports/createReport",
  async ({ eventSlug, reportData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/${eventSlug}/reports/`, {
        event: reportData.event,
        description: reportData.description,
        user_full_name: reportData.user_full_name,
        phone_number: reportData.phone_number,
        images: reportData.images || [],
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  "reports/updateReportStatus",
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/reports/${id}/admin/`, statusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  userReports: [],
  eventReports: [],
  currentReport: null,
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearEventReports: (state) => {
      state.eventReports = [];
    },
    clearUserReports: (state) => {
      state.userReports = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Event Reports
      .addCase(fetchEventReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventReports.fulfilled, (state, action) => {
        state.loading = false;
        state.eventReports = action.payload;
      })
      .addCase(fetchEventReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Reports
      .addCase(fetchUserReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.loading = false;
        state.eventReports = action.payload;
      })
      .addCase(fetchUserReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Report
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.eventReports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Report Status
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.loading = false;

        const updateArray = (arr) => {
          const index = arr.findIndex((r) => r.id === action.payload.id);
          if (index !== -1) arr[index] = action.payload;
        };

        updateArray(state.eventReports);
        updateArray(state.userReports);

        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentReport,
  clearEventReports,
  clearUserReports,
} = reportSlice.actions;

export default reportSlice.reducer;
