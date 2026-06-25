import React, { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";
import { uploadImageToImgbb } from "@/lib/uploadImageToImgbb";
import {
  createEvent,
  selectEventCreating,
  selectEventErrors,
  clearEventErrors,
} from "@/redux/slices/eventSlice";
import { Helmet } from "react-helmet-async";

const SERVICE_CATALOG = [
  {
    id: "pae2Qcjh",
    key: "photography",
    label: "Photography",
    withDescription: true,
  },
  {
    id: "61jGbKHt",
    key: "videography",
    label: "Videography",
    withDescription: true,
  },
  {
    id: "DTiKelkk",
    key: "hall_booking",
    label: "Hall Booking",
    withDescription: true,
  },
  {
    id: "UmchEJit",
    key: "sound_system",
    label: "Sound System",
    withDescription: true,
  },
  { id: "jeUFI9F0", key: "lighting", label: "Lighting", withDescription: true },
  {
    id: "yGvocXvs",
    key: "chef_booking",
    label: "Chef Booking",
    withDescription: true,
  },
  { id: "BWRh7ZP9", key: "catering", label: "Catering", withDescription: true },
];

const WORD_LIMITS = { titleWords: 15, descWords: 900 };
const MAX_GALLERY = 5;
const MAX_GALLERY_SIZE_MB = 5;
const MAX_LOGO_SIZE_MB = 3;

function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}
function countWords(str) {
  return (str?.trim()?.match(/\S+/g) || []).length;
}

export default function CreateServices() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const creating = useSelector(selectEventCreating);
  const { error, fieldErrors } = useSelector(selectEventErrors);

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [selectedServices, setSelectedServices] = useState(() =>
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const galleryInputRef = useRef(null);
  const logoInputRef = useRef(null);

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

  const toggleService = (key, checked) => {
    setSelectedServices((prev) => ({ ...prev, [key]: !!checked }));
  };

  const onDropGallery = (files) => {
    const current = [...gallery];
    for (const f of files) {
      if (!f.type.match(/image\/(png|jpe?g)/i)) continue;
      if (bytesToMB(f.size) > MAX_GALLERY_SIZE_MB) continue;
      if (current.length >= MAX_GALLERY) break;
      current.push({ file: f, url: URL.createObjectURL(f) });
    }
    setGallery(current);
  };

  const onPickGallery = (e) => {
    const files = Array.from(e.target.files || []);
    onDropGallery(files);
    e.target.value = "";
  };

  const removeGalleryItem = (idx) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPickLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match(/image\/(png|jpe?g|svg\+xml)/i)) return;
    if (bytesToMB(f.size) > MAX_LOGO_SIZE_MB) return;
    setLogo({ file: f, url: URL.createObjectURL(f) });
    e.target.value = "";
  };

  const uploadImages = async (files) => {
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImageToImgbb(files[i]);
        uploadedUrls.push({
          image: url,
          position: i + 1,
          is_primary: i === 0,
        });
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (error) {
        console.error("Failed to upload image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearEventErrors());

    if (titleError || descError) return;
    if (!logo) {
      alert("Please upload a logo for your service");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const logoUrl = await uploadImageToImgbb(logo.file);
      const galleryFiles = gallery.map((g) => g.file);
      const galleryImages = await uploadImages(galleryFiles);

      const serviceDetails = SERVICE_CATALOG.filter(
        (s) => selectedServices[s.key],
      ).map((s) => ({
        service: s.key,
        short_description: serviceNotes[s.key] || "",
        price: servicePrices[s.key] || "0.00",
        is_available: true,
      }));

      const payload = {
        title: title.trim(),
        description: description.trim(),
        brand_name: brandName.trim(),
        is_active: true,
        service_details: serviceDetails,
        logo: logoUrl,
        gallery_images: galleryImages,
        // location: location.trim(),
      };

      const result = await dispatch(createEvent(payload)).unwrap();
      navigate(`/events/${result.slug}`);
    } catch (error) {
      // Already handled by toast + slice
      console.error("Failed to create event:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const coerceArr = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <Helmet>
        <title>Create Event - Biya Kormu</title>
        <meta
          name="description"
          content="Create a new event on Biya Kormu to share with our community."
        />
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {slug ? "Edit Service" : "Create Service"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details to list your service
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex">
            Draft
          </Badge>
        </div>

        {/* Inline Field Errors (top) */}
        {fieldErrors &&
          Object.entries(fieldErrors).map(([field, errs]) => {
            const errorList = coerceArr(errs);
            return (
              <div key={field} className="text-sm text-destructive">
                <strong>{field}:</strong> {errorList.join(", ")}
              </div>
            );
          })}

        {/* Error Card */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                {Array.isArray(error) ? error.join(", ") : String(error)}
              </div>
              {fieldErrors && Object.keys(fieldErrors).length > 0 && (
                <div className="mt-2 text-sm">
                  {Object.entries(fieldErrors).map(([field, errs]) => {
                    const list = coerceArr(errs);
                    return (
                      <div key={field}>
                        <strong>{field}:</strong> {list.join(", ")}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Uploading images... Please don't close this page.
              </p>
            </CardContent>
          </Card>
        )}

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
                  disabled={uploading}
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
                    disabled={uploading}
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
                disabled={uploading}
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
                  disabled={uploading}
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
                <div key={s.id} className="space-y-2 rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`svc-${s.key}`}
                      checked={selectedServices[s.key]}
                      onCheckedChange={(checked) =>
                        toggleService(s.key, checked)
                      }
                      disabled={uploading}
                    />
                    <Label htmlFor={`svc-${s.key}`} className="font-medium">
                      {s.label}
                    </Label>
                  </div>

                  {selectedServices[s.key] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 pb-1">
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
                          disabled={uploading}
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
                        disabled={uploading}
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
                    {logo ? (
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
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Change Logo
                    </Button>
                    {logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLogo(null)}
                        disabled={uploading}
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
                    e.preventDefault();
                    if (!uploading) {
                      onDropGallery(Array.from(e.dataTransfer.files || []));
                    }
                  }}
                  className="flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed bg-muted/20 p-4 text-center"
                  onClick={() => !uploading && galleryInputRef.current?.click()}
                  style={{ cursor: uploading ? "not-allowed" : "pointer" }}
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
                  disabled={uploading}
                />

                {gallery.length > 0 && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {gallery.map((g, idx) => (
                        <div
                          key={idx}
                          className="group relative overflow-hidden rounded-xl border"
                        >
                          <img
                            src={g.url}
                            alt={`gallery-${idx}`}
                            className="h-28 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => !uploading && removeGalleryItem(idx)}
                            className="absolute right-2 top-2 hidden rounded-full bg-background/80 p-1 shadow group-hover:block"
                            aria-label="Remove image"
                            disabled={uploading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {gallery.map((g, idx) => (
                        <span key={idx} className="rounded bg-muted px-2 py-1">
                          {g.file?.name || `image-${idx + 1}`}
                        </span>
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
              Review everything and click Create Service to publish.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={
                !!titleError || !!descError || !logo || uploading || creating
              }
              type="submit"
            >
              {creating || uploading ? "Creating..." : "Create Service"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
