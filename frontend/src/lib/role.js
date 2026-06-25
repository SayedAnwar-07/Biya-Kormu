export const normalize = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

export const toEffectiveRole = (raw) => {
  const r = normalize(raw);
  if (r === "administrator") return "admin";
  if (r.startsWith("sell")) return "seller";
  return r;
};

export const isSellerLike = (raw) => {
  const r = toEffectiveRole(raw);
  return r === "seller" || r === "admin";
};
