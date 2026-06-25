import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfile,
  updateProfile,
  clearError,
  clearMessage,
} from "@/redux/slices/userSlice";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  X,
  Mail,
  Calendar,
  Shield,
  Building,
  User,
  Phone,
  MessageSquare,
  Camera,
  Save,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import AvatarCropper from "@/components/auth/AvatarCropper";
import { uploadImageToImgbb } from "@/lib/uploadImageToImgbb";
import BackButton from "@/components/BackButton";
import { Helmet } from "react-helmet-async";

const ProfilePageSettings = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error, message } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    whatsapp_number: "",
    profile_image: "",
  });

  useEffect(() => {
    if (slug) dispatch(getProfile(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        whatsapp_number: user.whatsapp_number || "",
        profile_image: user.profile_image || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      const msg =
        error?.error ||
        error?.message ||
        (typeof error === "string" ? error : "Something went wrong");
      toast.error(msg);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        whatsapp_number: user.whatsapp_number || "",
        profile_image: user.profile_image || "",
      });
    }
    setSelectedFile(null);
    setCroppedImage(null);
    setIsEditing(false);
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setSelectedFile(file);
    setCropperOpen(true);
  };

  const handleCropSave = async (blob) => {
    setCroppedImage(blob);
    setCropperOpen(false);

    // Create a preview URL for the cropped image
    const url = URL.createObjectURL(blob);
    setFormData((prev) => ({ ...prev, profile_image: url }));
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let payload = { ...formData };

      if (croppedImage) {
        try {
          const url = await uploadImageToImgbb(croppedImage);
          payload.profile_image = url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error(`Image upload failed: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      const result = await dispatch(
        updateProfile({ slug, userData: payload }),
      ).unwrap();

      setIsEditing(false);
      setSelectedFile(null);
      setCroppedImage(null);

      // Check if the backend returned a new slug
      const newSlug =
        result?.user?.slug ||
        result?.user?.profile_url?.split("/").filter(Boolean).pop();

      if (newSlug && newSlug !== slug) {
        // Navigate to the new slug if it changed
        navigate("/");
      } else {
        // Otherwise just refresh the data
        dispatch(getProfile(slug));
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  // loading skeleton
  if (loading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>
          {user
            ? `${user.full_name} Settings - Biya Kormu`
            : "Profile Settings Page - Biya Kormu"}
        </title>
        <meta
          name="description"
          content={
            user?.description ||
            "Manage your Biya Kormu profile settings and preferences"
          }
        />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden pt-0 pb-8">
              <CardHeader className="bg-muted/30 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 pt-8">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                      <AvatarImage
                        src={formData.profile_image}
                        alt={`${formData.first_name} ${formData.last_name}`}
                      />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {getInitials(formData.first_name, formData.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Label
                        htmlFor="profile-image-upload"
                        className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer shadow-md"
                      >
                        <Camera className="h-4 w-4 text-white" />
                        <Input
                          id="profile-image-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept="image/*"
                        />
                      </Label>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {formData.first_name} {formData.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </CardDescription>
                  {user.is_verified && (
                    <Badge variant="outline" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="h-4 w-4 mr-2" />
                    {user.user_type}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col space-y-2">
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing((v) => !v)}
                    disabled={isSubmitting}
                    className="w-full justify-start"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Editing
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full justify-start"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="whatsapp_number"
                      className="flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp Number
                    </Label>
                    <Input
                      id="whatsapp_number"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your WhatsApp number"
                    />
                  </div>
                </div>

                {selectedFile && (
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Camera className="h-4 w-4 mr-1" />
                    {croppedImage
                      ? "Image cropped and ready to upload"
                      : "New image selected: " + selectedFile.name}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Avatar Cropper Modal */}
      <AvatarCropper
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={selectedFile ? URL.createObjectURL(selectedFile) : null}
        onCancel={handleCropCancel}
        onSave={handleCropSave}
      />
    </div>
  );
};

export default ProfilePageSettings;
