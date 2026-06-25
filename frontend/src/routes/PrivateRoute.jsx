import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { toEffectiveRole } from "@/lib/role";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { isAuthenticated, token, user } = useSelector(
    (state) => state.user || {}
  );

  const hasAuth = Boolean(
    isAuthenticated || token || localStorage.getItem("accessToken")
  );
  if (!hasAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles || allowedRoles.length === 0) return children;

  const rawRole =
    user?.user_type ??
    user?.role ??
    user?.profile?.user_type ??
    localStorage.getItem("user_type") ??
    "";

  const effectiveRole = toEffectiveRole(rawRole);
  const normalizedAllowed = allowedRoles.map(toEffectiveRole);

  if (!normalizedAllowed.includes(effectiveRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
