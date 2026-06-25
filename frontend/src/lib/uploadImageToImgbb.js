import axios from "axios";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export async function uploadImageToImgbb(blob) {
  if (!IMGBB_API_KEY) {
    throw new Error("IMGBB API key missing. Set VITE_IMGBB_API_KEY in .env");
  }

  const form = new FormData();
  const filename = (blob && (blob.name || blob.filename)) || "upload.png";
  form.append("image", blob, filename);

  try {
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form
    );

    if (!res.data?.success || !res.data?.data?.url) {
      throw new Error(
        res.data?.error?.message || "Failed to upload image to IMGBB"
      );
    }

    return res.data.data.url;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Image upload failed: ${
          error.response.data?.error?.message || "Server error"
        }`
      );
    } else if (error.request) {
      throw new Error("Image upload failed: No response from server");
    } else {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }
}
