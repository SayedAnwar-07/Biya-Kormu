"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AlertCircle, Crop as CropIcon, RefreshCw } from "lucide-react";

const initialCropPercent = {
  unit: "%",
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  aspect: 0,
};

const OUTPUT_MIME = "image/png";
const OUTPUT_QUALITY = 0.92;

function getCenteredAspectCrop(mediaWidth, mediaHeight, aspect) {
  const base = Math.min(mediaWidth, mediaHeight) * 0.9;
  const crop = makeAspectCrop(
    { unit: "px", width: base, x: 0, y: 0 },
    aspect || 1,
    mediaWidth,
    mediaHeight
  );
  return centerCrop(crop, mediaWidth, mediaHeight);
}

function drawToCanvas(canvas, image, pixelCrop) {
  if (!canvas || !image || !pixelCrop?.width || !pixelCrop?.height) return;

  const dpr = window.devicePixelRatio || 1;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const sx = pixelCrop.x * scaleX;
  const sy = pixelCrop.y * scaleY;
  const sw = pixelCrop.width * scaleX;
  const sh = pixelCrop.height * scaleY;

  const outW = Math.max(1, Math.floor(sw));
  const outH = Math.max(1, Math.floor(sh));

  canvas.width = Math.floor(outW * dpr);
  canvas.height = Math.floor(outH * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);
}

/* ------------------- Component ------------------- */

export default function AvatarCropper({
  open,
  onOpenChange,
  imageSrc,
  onCancel,
  onSave, 
}) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const [percentCrop, setPercentCrop] = useState(initialCropPercent);
  const [pixelCrop, setPixelCrop] = useState(null);
  const [aspect, setAspect] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPercentCrop(initialCropPercent);
      setPixelCrop(null);
      setAspect(0);
    }
  }, [open, imageSrc]);

  const onImageLoad = useCallback(
    (e) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      if (aspect) {
        const centered = getCenteredAspectCrop(
          naturalWidth,
          naturalHeight,
          aspect
        );
        setPercentCrop({
          unit: "%",
          x: (centered.x / naturalWidth) * 100,
          y: (centered.y / naturalHeight) * 100,
          width: (centered.width / naturalWidth) * 100,
          height: (centered.height / naturalHeight) * 100,
          aspect,
        });
      } else {
        setPercentCrop(initialCropPercent);
      }
    },
    [aspect]
  );

  useEffect(() => {
    if (!pixelCrop || !imgRef.current || !canvasRef.current) return;
    drawToCanvas(canvasRef.current, imgRef.current, pixelCrop);
  }, [pixelCrop]);

  const setAspectMode = useCallback((nextAspect) => {
    setAspect(nextAspect);
    const img = imgRef.current;
    if (!img) return;

    if (!nextAspect) {
      setPercentCrop((c) => ({ ...c, aspect: 0 }));
      return;
    }

    const centered = getCenteredAspectCrop(
      img.naturalWidth,
      img.naturalHeight,
      nextAspect
    );
    setPercentCrop({
      unit: "%",
      x: (centered.x / img.naturalWidth) * 100,
      y: (centered.y / img.naturalHeight) * 100,
      width: (centered.width / img.naturalWidth) * 100,
      height: (centered.height / img.naturalHeight) * 100,
      aspect: nextAspect,
    });
  }, []);

  const handleReset = useCallback(() => {
    setAspect(0);
    setPercentCrop(initialCropPercent);
    setPixelCrop(null);
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) {
      setIsSaving(false);
      return;
    }

    let finalPixelCrop = pixelCrop;
    if (!finalPixelCrop && imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      finalPixelCrop = {
        x: (percentCrop.x / 100) * naturalWidth,
        y: (percentCrop.y / 100) * naturalHeight,
        width: (percentCrop.width / 100) * naturalWidth,
        height: (percentCrop.height / 100) * naturalHeight,
      };
    }

    if (!finalPixelCrop) {
      setIsSaving(false);
      return;
    }

    drawToCanvas(canvas, imgRef.current, finalPixelCrop);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          setIsSaving(false);
          return;
        }
        Promise.resolve(onSave?.(blob)).finally(() => {
          setIsSaving(false);
        });
      },
      OUTPUT_MIME,
      OUTPUT_MIME === "image/jpeg" || OUTPUT_MIME === "image/webp"
        ? OUTPUT_QUALITY
        : undefined
    );
  }, [onSave, pixelCrop, percentCrop]);

  const canSave = useMemo(
    () => pixelCrop && pixelCrop.width > 4 && pixelCrop.height > 4,
    [pixelCrop]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[min(96vw,1100px)]
          max-w-none
          p-4 sm:p-6
          max-h-[90vh]
          overflow-auto
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Profile Image
          </DialogTitle>
          <DialogDescription>
            Drag the handles. Pick an aspect ratio or keep it free.
          </DialogDescription>
        </DialogHeader>

        {!imageSrc ? (
          <div className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            No image selected. Please upload an image first.
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Label className="mr-1 text-xs uppercase text-muted-foreground">
                Aspect:
              </Label>
              <Button
                type="button"
                variant={aspect === 0 ? "default" : "secondary"}
                size="sm"
                onClick={() => setAspectMode(0)}
              >
                Free
              </Button>
              <Button
                type="button"
                variant={aspect === 1 ? "default" : "secondary"}
                size="sm"
                onClick={() => setAspectMode(1)}
              >
                1:1
              </Button>
              <Button
                type="button"
                variant={aspect === 4 / 5 ? "default" : "secondary"}
                size="sm"
                onClick={() => setAspectMode(4 / 5)}
              >
                4:5
              </Button>
              <Button
                type="button"
                variant={aspect === 16 / 9 ? "default" : "secondary"}
                size="sm"
                onClick={() => setAspectMode(16 / 9)}
              >
                16:9
              </Button>

              <Separator className="mx-2 h-6" orientation="vertical" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
            </div>

            {/* Work area */}
            <div
              className="
                mt-4 grid gap-4
                md:grid-cols-2
                overflow-auto
              "
              style={{ minHeight: 0 }}
            >
              {/* Cropper */}
              <div
                className="
                  overflow-auto rounded-md border bg-muted/20 p-2
                  max-h-[55vh] sm:max-h-[60vh] md:max-h-[70vh]
                  touch-none
                "
              >
                <ReactCrop
                  crop={percentCrop}
                  onChange={(nextPixelCrop, nextPercentCrop) => {
                    setPixelCrop(nextPixelCrop);
                    setPercentCrop(nextPercentCrop);
                  }}
                  onComplete={(nextPixelCrop) => {
                    setPixelCrop(nextPixelCrop);
                  }}
                  keepSelection
                  aspect={aspect || undefined}
                  className="max-h-[70vh]"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="To crop"
                    onLoad={onImageLoad}
                    className="h-auto max-h-[70vh] w-full max-w-none select-none"
                    draggable={false}
                  />
                </ReactCrop>
              </div>

              {/* Live preview */}
              <div className="flex flex-col">
                <Label className="mb-2 text-sm">Preview</Label>
                <div className="relative w-full rounded-md border bg-background p-2">
                  <div className="aspect-square w-full overflow-hidden rounded">
                    <canvas
                      ref={canvasRef}
                      className="h-full w-full"
                      aria-label="Cropped preview"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This is the exact image that will be uploaded.
                </p>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Crop"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
