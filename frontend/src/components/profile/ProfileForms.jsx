import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Phone,
  MessageSquare,
  Save,
  X,
  Upload,
  ImagePlus,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

import AvatarCropper from "@/components/auth/AvatarCropper";
import { uploadImageToImgbb } from "@/lib/uploadImageToImgbb";

const ProfileForms = ({
  formData,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  /* -------- avatar upload / crop -------- */
  const fileRef = useRef(null);
  const [rawImage, setRawImage] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(formData?.profile_image || "");

  useEffect(() => {
    if (formData?.profile_image !== avatarUrl) {
      setAvatarUrl(formData?.profile_image || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.profile_image]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setCropOpen(true);
    };
    reader.readAsDataURL(f);
  };

  const handleCropSave = async (blob) => {
    try {
      setUploadingAvatar(true);
      const url = await uploadImageToImgbb(blob);
      setAvatarUrl(url);
      setCropOpen(false);
      onChange?.({ target: { name: "profile_image", value: url } });
      toast.success("Profile image uploaded.");
    } catch (e) {
      toast.error(e.message || "Failed to upload image");
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Manage your personal information and contact details
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Avatar */}
        <div className="mb-4 flex items-start gap-5">
          <Avatar className="h-20 w-20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : (
              <AvatarFallback>
                <ImagePlus className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>

          <div>
            <p className="text-sm font-medium">
              Profile Image{" "}
              <span className="text-muted-foreground">(optional)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              JPG/PNG/JPEG · Max 5MB · Crop freely (square, horizontal,
              vertical)
            </p>

            <div className="mt-2 flex gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={!isEditing || uploadingAvatar || isSubmitting}
              >
                {uploadingAvatar ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCropOpen(true)}
                  disabled={!isEditing || uploadingAvatar || isSubmitting}
                >
                  Re-crop
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cropper Modal */}
        <AvatarCropper
          open={cropOpen}
          onOpenChange={setCropOpen}
          imageSrc={rawImage}
          onCancel={() => setCropOpen(false)}
          onSave={handleCropSave}
        />

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
                disabled={!isEditing || isSubmitting}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={onChange}
                disabled={!isEditing || isSubmitting}
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Hidden input to ensure profile_image is part of formData if needed */}
          <input
            type="hidden"
            name="profile_image"
            value={avatarUrl || ""}
            readOnly
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={onChange}
                disabled={!isEditing || isSubmitting}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={onChange}
                disabled={!isEditing || isSubmitting}
                placeholder="+1234567890"
              />
            </div>
          </div>

          {isEditing && (
            <CardFooter className="px-0 pt-6">
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || uploadingAvatar}
                >
                  {isSubmitting ? (
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || uploadingAvatar}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardFooter>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForms;
