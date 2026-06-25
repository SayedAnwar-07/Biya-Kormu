import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  MapPin,
  Building2,
  FileText,
  Loader2,
} from "lucide-react";

import { uploadImageToImgbb } from "@/lib/uploadImageToImgbb";
import {
  fetchEvent,
  updateEvent,
  selectEventBySlug,
  selectEventUpdating,
  selectEventLoading,
} from "@/redux/slices/eventSlice";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const SERVICE_CATALOG = [
  { key: "photography", label: "Photography", withDescription: true },
  { key: "videography", label: "Videography", withDescription: true },
  { key: "hall_booking", label: "Hall Booking", withDescription: true },
  { key: "sound_system", label: "Sound System", withDescription: true },
  { key: "lighting", label: "Lighting", withDescription: true },
  { key: "chef_booking", label: "Chef Booking", withDescription: true },
  { key: "catering", label: "Catering", withDescription: true },
];

const WORD_LIMITS = { titleWords: 15, descWords: 900 };
const MAX_GALLERY = 5;
const MAX_GALLERY_SIZE_MB = 5;
const MAX_LOGO_SIZE_MB = 3;
const REDIRECT_DELAY = 5000;

function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}
function countWords(str) {
  return (str?.trim()?.match(/\S+/g) || []).length;
}
function isAcceptableImage(file, allowSvg = false) {
  const re = allowSvg ? /image\/(png|jpe?g|svg\+xml)/i : /image\/(png|jpe?g)/i;
  return re.test(file?.type || "");
}

export default function EditService() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Store state
  const eventItem = useSelector((s) => selectEventBySlug(s, slug));
  const eventLoading = useSelector(selectEventLoading);
  const updating = useSelector(selectEventUpdating);
  const user = useSelector((s) => s.user?.user);

  // Local form state
  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedServices, setSelectedServices] = useState(
    SERVICE_CATALOG.reduce((acc, s) => ({ ...acc, [s.key]: false }), {}),
  );
  const [serviceNotes, setServiceNotes] = useState(
    SERVICE_CATALOG.reduce((acc, s) => ({ ...acc, [s.key]: "" }), {}),
  );
  const [servicePrices, setServicePrices] = useState(
    SERVICE_CATALOG.reduce((acc, s) => ({ ...acc, [s.key]: "" }), {}),
  );
  const [logo, setLogo] = useState(null);
  const [gallery, setGallery] = useState([]);

  // redirect timer via ref (avoid stale/cleanup issues)
  const redirectTimerRef = useRef(null);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  // keep track of created object URLs to revoke on unmount
  const createdObjectUrlsRef = useRef(new Set());

  const galleryInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Derived values
  const titleWordCount = useMemo(() => countWords(title), [title]);
  const descWordCount = useMemo(() => countWords(description), [description]);
  const titleError =
    titleWordCount > WORD_LIMITS.titleWords
      ? `Keep under ${WORD_LIMITS.titleWords} words`
      : "";
  const descError =
    descWordCount > WORD_LIMITS.descWords
      ? `Keep under ${WORD_LIMITS.descWords} words`
      : "";

  const isOwner = Boolean(
    user?.id &&
    eventItem?.seller_info?.id &&
    user.id === eventItem.seller_info.id,
  );
  const readOnly = !isOwner;

  // ==================== EFFECTS ====================

  // Fetch event if not in cache
  useEffect(() => {
    if (!slug) return;
    if (!eventItem) {
      dispatch(fetchEvent(slug));
    }
  }, [slug, eventItem, dispatch]);

  // Prefill form when event loads
  useEffect(() => {
    if (!eventItem) return;

    setTitle(eventItem.title || "");
    setBrandName(eventItem.brand_name || "");
    setDescription(eventItem.description || "");
    setLocation(eventItem.location || ""); // was "", now safer

    // Logo (server source)
    setLogo(eventItem.logo ? { url: eventItem.logo, _source: "server" } : null);

    // Services
    const svcSelected = SERVICE_CATALOG.reduce(
      (a, s) => ({ ...a, [s.key]: false }),
      {},
    );
    const svcNotes = SERVICE_CATALOG.reduce(
      (a, s) => ({ ...a, [s.key]: "" }),
      {},
    );
    const svcPrices = SERVICE_CATALOG.reduce(
      (a, s) => ({ ...a, [s.key]: "" }),
      {},
    );

    (eventItem.service_details || []).forEach((sd) => {
      const key = (sd?.service || "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(svcSelected, key)) {
        svcSelected[key] = true;
        svcNotes[key] = sd?.short_description || "";
        svcPrices[key] = sd?.price || "";
      }
    });

    setSelectedServices(svcSelected);
    setServiceNotes(svcNotes);
    setServicePrices(svcPrices);

    // Gallery
    const rawGallery = Array.isArray(eventItem.gallery_images)
      ? eventItem.gallery_images
      : [];
    const serverGallery = [...rawGallery]
      .sort((a, b) => (a?.position || 0) - (b?.position || 0))
      .slice(0, MAX_GALLERY)
      .map((g) => ({
        url: g?.image || g?.url || "",
        position: g?.position,
        is_primary: !!g?.is_primary,
        _source: "server",
      }))
      .filter((g) => g.url);

    setGallery(serverGallery);
  }, [eventItem]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      // revoke any created object URLs
      createdObjectUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      createdObjectUrlsRef.current.clear();
    };
  }, []);

  // ==================== HANDLERS ====================

  const toggleService = (key, checked) => {
    setSelectedServices((prev) => ({ ...prev, [key]: !!checked }));
  };

  const onDropGallery = (files) => {
    const current = [...gallery];
    const remainingSlots = MAX_GALLERY - current.length;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_GALLERY} images allowed`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    for (const f of filesToAdd) {
      if (!isAcceptableImage(f)) {
        toast.error("Only PNG and JPG images are allowed");
        continue;
      }
      if (bytesToMB(f.size) > MAX_GALLERY_SIZE_MB) {
        toast.error(`Image size must be less than ${MAX_GALLERY_SIZE_MB}MB`);
        continue;
      }
      const url = URL.createObjectURL(f);
      createdObjectUrlsRef.current.add(url);
      current.push({ file: f, url, _source: "new" });
    }

    setGallery(current);
  };

  const onPickGallery = (e) => {
    const files = Array.from(e.target.files || []);
    onDropGallery(files);
    e.target.value = "";
  };

  const removeGalleryItem = (idx) => {
    setGallery((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      // revoke URL if it was created locally
      if (removed?._source === "new" && removed?.url) {
        try {
          URL.revokeObjectURL(removed.url);
          createdObjectUrlsRef.current.delete(removed.url);
        } catch {}
      }
      return next;
    });
  };

  const onPickLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isAcceptableImage(f, /*allowSvg*/ true)) {
      toast.error("Logo must be PNG/JPG/SVG");
      return;
    }
    if (bytesToMB(f.size) > MAX_LOGO_SIZE_MB) {
      toast.error(`Logo size must be ≤ ${MAX_LOGO_SIZE_MB}MB`);
      return;
    }
    const url = URL.createObjectURL(f);
    createdObjectUrlsRef.current.add(url);
    setLogo({ file: f, url, _source: "new" });
    e.target.value = "";
  };

  const startRedirectTimer = (targetPath) => {
    let countdown = REDIRECT_DELAY / 1000;
    setRedirectCountdown(countdown);

    // clear previous if any
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
    }

    redirectTimerRef.current = setInterval(() => {
      countdown -= 1;
      setRedirectCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
        navigate(targetPath);
      }
    }, 1000);
  };

  const cancelRedirect = () => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
      setRedirectCountdown(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error("Only the seller can edit this event.");
      return;
    }
    if (titleError || descError) {
      toast.error("Please fix validation errors.");
      return;
    }

    try {
      // Upload new logo if changed
      let logoUrl = logo?.url || null;
      if (logo?._source === "new" && logo?.file) {
        logoUrl = await uploadImageToImgbb(logo.file);
      }

      // Upload new gallery images only, keep server ones
      const updatedGallery = [];
      for (const [index, item] of gallery.entries()) {
        if (item?._source === "new" && item?.file) {
          const url = await uploadImageToImgbb(item.file);
          updatedGallery.push({
            image: url,
            position: index + 1,
            is_primary: index === 0,
          });
        } else {
          updatedGallery.push({
            image: item.url,
            position: index + 1,
            is_primary: index === 0,
          });
        }
      }

      // Build service_details from selectedServices + notes + prices
      const service_details = SERVICE_CATALOG.filter(
        (s) => selectedServices[s.key],
      ).map((s) => ({
        service: s.key,
        short_description: serviceNotes[s.key] || "",
        price: servicePrices[s.key] || "0.00",
        is_available: true,
      }));

      // Build final PATCH payload (send only changed/meaningful fields)
      const payload = {
        title: title.trim(),
        brand_name: brandName.trim(),
        description: description.trim(),
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(service_details.length ? { service_details } : {}),
        ...(updatedGallery.length ? { gallery_images: updatedGallery } : {}),
        // Optionally: location if backend supports
        // ...(location?.trim() ? { location: location.trim() } : {}),
      };

      // Dispatch PATCH
      const action = await dispatch(updateEvent({ slug, payload }));
      if (updateEvent.fulfilled.match(action)) {
        toast.success("Your event has been updated. Redirecting…");
        // go to the updated event page rather than home
        startRedirectTimer(`/events/${slug}`);
      } else {
        const msg =
          action.payload?.globalErrors?.[0] ||
          "Failed to update event. Please try again.";
        toast.error(msg);
      }
    } catch (err) {
      toast.error(
        err?.message || "Something went wrong while uploading or saving.",
      );
    }
  };

  // ==================== RENDER LOGIC ====================

  if (eventLoading && !eventItem) {
    return (
      <div className="mx-auto w-full max-w-6xl p-8 flex items-center justify-center">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <span>Loading event…</span>
      </div>
    );
  }

  if (!eventItem) {
    return (
      <div className="mx-auto w-full max-w-6xl p-8">
        <p className="text-sm text-muted-foreground">Event not found.</p>
        <Link to="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="mx-auto w-full max-w-6xl p-8">
        <div className="mb-4 rounded-xl border bg-amber-50 p-3 text-amber-900">
          You're viewing as a non-owner. Editing is disabled. ( দুষ্টু ছেলে এটা
          তোমার ইভেন্ট না, যাও নিজের একাউন্টে যাও )
        </div>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <Helmet>
        <title>
          {eventItem
            ? `${eventItem.brand_name} Edit - Biya Kormu`
            : "Edit Services - Biya Kormu"}
        </title>
        <meta
          name="description"
          content={
            eventItem?.description || "Edit your event details on Biya Kormu."
          }
        />
      </Helmet>

      {redirectTimerRef.current && (
        <div className="mb-4 rounded-xl border bg-blue-50 p-3 text-blue-900">
          <p>
            Update successful! Redirecting to event page in {redirectCountdown}{" "}
            seconds...
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={cancelRedirect}
          >
            Cancel Redirect
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Update details for{" "}
              <span className="font-medium">{eventItem.title}</span>
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex">
            Draft
          </Badge>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <FileText className="h-4 w-4" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title (keep under 15 words)</Label>
                <Input
                  id="title"
                  placeholder="Service title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={readOnly}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {titleWordCount} / {WORD_LIMITS.titleWords} words
                  </span>
                  {titleError && (
                    <span className="text-destructive">{titleError}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand Name</Label>
                <div className="relative">
                  <Input
                    id="brand"
                    placeholder="Your brand name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={readOnly}
                  />
                  <Building2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description (keep under 900 words)
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your service in detail"
                className="min-h-[140px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={readOnly}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {descWordCount} / {WORD_LIMITS.descWords} words
                </span>
                {descError && (
                  <span className="text-destructive">{descError}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  placeholder="Where is your service located?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={readOnly}
                />
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {SERVICE_CATALOG.map((s) => (
                <div key={s.key} className="space-y-2 rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`svc-${s.key}`}
                      checked={!!selectedServices[s.key]}
                      onCheckedChange={(checked) =>
                        toggleService(s.key, checked)
                      }
                      disabled={readOnly}
                    />
                    <Label htmlFor={`svc-${s.key}`} className="font-medium">
                      {s.label}
                    </Label>
                  </div>

                  {selectedServices[s.key] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 pb-1 pl-7">
                      {s.withDescription && (
                        <Input
                          placeholder={`Add description for ${s.label.toLowerCase()}`}
                          value={serviceNotes[s.key] || ""}
                          onChange={(e) =>
                            setServiceNotes((prev) => ({
                              ...prev,
                              [s.key]: e.target.value,
                            }))
                          }
                          disabled={readOnly}
                        />
                      )}
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={servicePrices[s.key] || ""}
                        onChange={(e) =>
                          setServicePrices((prev) => ({
                            ...prev,
                            [s.key]: e.target.value,
                          }))
                        }
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Logo uploader */}
              <div className="space-y-3">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
                    {logo?.url ? (
                      <img
                        src={logo.url}
                        alt="logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-x-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={onPickLogo}
                      disabled={readOnly}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={readOnly}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Change Logo
                    </Button>
                    {logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          // revoke if it was new
                          if (logo?._source === "new" && logo?.url) {
                            try {
                              URL.revokeObjectURL(logo.url);
                              createdObjectUrlsRef.current.delete(logo.url);
                            } catch {}
                          }
                          setLogo(null);
                        }}
                        disabled={readOnly}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG/JPG/SVG up to {MAX_LOGO_SIZE_MB}MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery uploader */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Gallery Images (max {MAX_GALLERY})</Label>
                  <span className="text-xs text-muted-foreground">
                    {gallery.length} / {MAX_GALLERY} selected
                  </span>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    if (readOnly) return;
                    e.preventDefault();
                    onDropGallery(Array.from(e.dataTransfer.files || []));
                  }}
                  className="flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed bg-muted/20 p-4 text-center"
                  onClick={() => !readOnly && galleryInputRef.current?.click()}
                  style={{ cursor: readOnly ? "not-allowed" : "pointer" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-5 w-5" />
                    <p className="text-sm">Drag and drop images here</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to {MAX_GALLERY_SIZE_MB}MB (max {MAX_GALLERY}{" "}
                      images)
                    </p>
                  </div>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/png,image/jpeg"
                  onChange={onPickGallery}
                  disabled={readOnly}
                />

                {gallery.length > 0 && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {gallery.map((g, idx) => (
                        <div
                          key={`${g.url}-${idx}`}
                          className="group relative overflow-hidden rounded-xl border"
                        >
                          <img
                            src={g.url}
                            alt={`gallery-${idx}`}
                            className="h-28 w-full object-cover"
                          />
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(idx)}
                              className="absolute right-2 top-2 rounded-full bg-background/80 p-1 shadow"
                              aria-label="Remove image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          {idx === 0 && (
                            <span className="absolute left-2 top-2 rounded bg-background/80 px-2 py-0.5 text-[10px] shadow">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="sticky bottom-4 z-10 mt-8 rounded-2xl border bg-background/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Review everything and click Update to save changes.
            </p>
            <div className="flex items-center gap-2">
              <Link to={`/events/${slug}`}>
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                disabled={readOnly || !!titleError || !!descError || updating}
                type="submit"
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Service
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
