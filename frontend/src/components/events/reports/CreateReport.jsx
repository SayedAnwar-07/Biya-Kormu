import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { createReport } from "@/redux/slices/reportSlice";
import { uploadImageToImgbb } from "@/lib/uploadImageToImgbb";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Image, AlertCircle, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  user_full_name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phone_number: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  images: z
    .array(z.string().url())
    .max(3, {
      message: "Maximum 3 images allowed.",
    })
    .optional(),
});

const CreateReport = ({ event, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => ({
    loading: state.reports?.loading ?? false,
    error: state.reports?.error ?? null,
  }));

  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      user_full_name: "",
      phone_number: "",
      images: [],
    },
  });

  const handleImageUpload = async (files) => {
    if (files.length + imageFiles.length > 3) {
      form.setError("images", {
        message: "Maximum 3 images allowed.",
      });
      return;
    }

    setUploadingImages(true);
    const newImageFiles = [...imageFiles];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadImageToImgbb(file);
        newImageFiles.push(imageUrl);
      }

      setImageFiles(newImageFiles);
      form.setValue("images", newImageFiles);
      form.clearErrors("images");
    } catch (error) {
      form.setError("images", {
        message: error.message || "Failed to upload images",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
    form.setValue("images", newImageFiles);
  };

  const onSubmit = async (values) => {
    try {
      // Filter out empty values and ensure we only send up to 3 images
      const filteredImages =
        values.images?.filter((url) => url.trim() !== "") || [];
      const imagesToSend = filteredImages.slice(0, 3);

      const result = await dispatch(
        createReport({
          eventSlug: event.slug, // Use event slug for the URL
          reportData: {
            event: event.id, // Use event ID for the request body
            description: values.description,
            user_full_name: values.user_full_name,
            phone_number: values.phone_number,
            images: imagesToSend,
          },
        })
      ).unwrap();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the slice
      console.error("Report submission failed:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message ||
                "There was an error submitting your report. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe the issue in detail..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific about what's wrong with this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="user_full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Evidence Images (Optional)</FormLabel>

          {/* File upload input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(Array.from(e.target.files))}
              className="hidden"
              disabled={uploadingImages || imageFiles.length >= 3}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center justify-center p-4 ${
                uploadingImages || imageFiles.length >= 3
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {uploadingImages
                  ? "Uploading images..."
                  : imageFiles.length >= 3
                  ? "Maximum 3 images reached"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB each
              </p>
            </label>
          </div>

          {/* Preview uploaded images */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {imageFiles.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <FormDescription>
            You can add up to 3 images as evidence. Images will be uploaded to
            ImgBB.
          </FormDescription>
          <FormMessage />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || uploadingImages}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploadingImages}>
            {(loading || uploadingImages) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Report
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateReport;
