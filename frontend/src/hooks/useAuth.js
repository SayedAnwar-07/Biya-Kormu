// hooks/useAuth.js
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const readLocalUser = () => {
  try {
    const raw = localStorage.getItem("userData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function useAuth() {
  const {
    user: reduxUser,
    isAuthenticated: reduxAuth,
    token,
  } = useSelector((s) => s.user || {});

  const [cachedUser, setCachedUser] = useState(() => readLocalUser());
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userData") setCachedUser(readLocalUser());
      if (e.key === "accessToken" && e.newValue === null) setCachedUser(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const user = useMemo(
    () => reduxUser ?? cachedUser ?? null,
    [reduxUser, cachedUser]
  );
  const isAuthenticated = useMemo(() => {
    return Boolean(reduxAuth || token || localStorage.getItem("accessToken"));
  }, [reduxAuth, token]);

  const role =
    user?.user_type ??
    user?.role ??
    user?.profile?.user_type ??
    localStorage.getItem("user_type") ??
    null;

  return { user, role, isAuthenticated, isLoading: false };
}
