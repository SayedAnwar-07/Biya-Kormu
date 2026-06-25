import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function normalizeErrors(payload) {
  const out = { fieldErrors: {}, globalErrors: [] };

  // Helper to push strings/arrays into globalErrors
  const pushGlobal = (v) => {
    if (!v) return;
    if (Array.isArray(v)) out.globalErrors.push(...v.map(String));
    else out.globalErrors.push(String(v));
  };

  // Helper to set field errors as arrays
  const setField = (field, v) => {
    if (v == null) return;
    const arr = Array.isArray(v) ? v.map(String) : [String(v)];
    out.fieldErrors[field] = arr;
  };

  if (!payload || typeof payload !== "object") {
    pushGlobal(typeof payload === "string" ? payload : "Something went wrong.");
    return out;
  }

  // Prefer message at top-level
  if (payload.message && !payload.errors) {
    pushGlobal(payload.message);
  }

  // If there's an errors object, process it carefully
  if (payload.errors && typeof payload.errors === "object") {
    Object.entries(payload.errors).forEach(([field, value]) => {
      // Treat detail/non_field_errors as global
      if (field === "detail" || field === "non_field_errors") {
        pushGlobal(value);
      } else {
        setField(field, value);
      }
    });
  }

  // Absorb other top-level keys (including detail/non_field_errors)
  Object.entries(payload).forEach(([k, v]) => {
    if (k === "message" || k === "errors" || v == null) return;

    if (k === "detail" || k === "non_field_errors") {
      pushGlobal(v);
      return;
    }

    // If it's an array or string, treat as field errors by key
    if (Array.isArray(v) || typeof v === "string") {
      setField(k, v);
    }
  });

  if (
    Object.keys(out.fieldErrors).length === 0 &&
    out.globalErrors.length === 0
  ) {
    out.globalErrors.push("Unknown error.");
  }
  return out;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data || { message: "Network error" };
    const normalized = normalizeErrors(payload);

    // Toast field errors (arrays)
    if (normalized.fieldErrors && Object.keys(normalized.fieldErrors).length) {
      Object.entries(normalized.fieldErrors).forEach(([field, msgs]) => {
        const list = Array.isArray(msgs) ? msgs : [msgs];
        list.forEach((m) => toast.error(`${field}: ${m}`));
      });
    }

    // Toast global errors
    if (normalized.globalErrors.length) {
      normalized.globalErrors.forEach((msg) => toast.error(msg));
    }

    // Reject with normalized structure so thunks get a consistent shape
    return Promise.reject(normalized);
  }
);

export default axiosInstance;
export { normalizeErrors };
