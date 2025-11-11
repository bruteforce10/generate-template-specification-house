import React, { useState, useEffect, useCallback } from "react";
import { Player } from "@remotion/player";
import { Link } from "react-router-dom";
import { Upload, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CalloutLabelVideo from "./CalloutLabelVideo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const FONT_OPTIONS = [
  { value: "Anton", label: "Anton" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Poppins", label: "Poppins" },
  { value: "Lato", label: "Lato" },
  { value: "Oswald", label: "Oswald" },
  { value: "Raleway", label: "Raleway" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Nunito", label: "Nunito" },
  { value: "Rubik", label: "Rubik" },
  { value: "PT Sans", label: "PT Sans" },
  { value: "Lora", label: "Lora" },
  { value: "Noto Sans", label: "Noto Sans" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Work Sans", label: "Work Sans" },
];

const formSchema = z.object({
  topText: z.string().min(1, "Top text harus diisi"),
  bottomText: z.string().min(1, "Bottom text harus diisi"),
  calloutColor: z.string(),
  borderColor: z.string(),
  borderThickness: z.number().min(1).max(20),
  lineThickness: z.number().min(1).max(30),
  markerSize: z.number().min(5).max(30),
  backgroundColor: z.string(),
  topTextColor: z.string(),
  bottomTextColor: z.string(),
  animationType: z.enum(["fade", "slideUp", "slideDown", "scale", "bounce"]),
  animationSettings: z.object({
    fadeIn: z.number().min(0),
    display: z.number().min(0),
    fadeOut: z.number().min(0),
  }),
  fontFamily: z.string(),
  arrowMirrored: z.boolean(),
  textSpacing: z.number().min(0).max(100),
  diagonalLength: z.number().min(0).max(2000),
  horizontalLength: z.number().min(0).max(2000),
});

const CalloutLabelGenerator = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topText: "Kuningan PIK",
      bottomText: "4 Menit",
      calloutColor: "#FF0000",
      borderColor: "#FF0000",
      borderThickness: 4,
      lineThickness: 8,
      markerSize: 12,
      backgroundColor: "#000000",
      topTextColor: "#FF0000",
      bottomTextColor: "#FFFFFF",
      animationType: "fade",
      animationSettings: {
        fadeIn: 1,
        display: 3,
        fadeOut: 1,
      },
      fontFamily: "Arial",
      arrowMirrored: false,
      textSpacing: 8,
      diagonalLength: 600,
      horizontalLength: 400,
    },
  });

  const formValues = form.watch();

  const calculateTotalDuration = useCallback(() => {
    const { fadeIn, display, fadeOut } = formValues.animationSettings || {
      fadeIn: 1,
      display: 3,
      fadeOut: 1,
    };
    return fadeIn + display + fadeOut;
  }, [formValues.animationSettings]);

  const [durationInFrames, setDurationInFrames] = useState(
    calculateTotalDuration() * 30
  );

  useEffect(() => {
    setDurationInFrames(Math.ceil(calculateTotalDuration() * 30));
  }, [calculateTotalDuration]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setImageFile(file);
        setImageUrl(url);
        toast.success("Gambar berhasil diupload");
      } else {
        toast.error("File harus berupa gambar");
      }
    }
  };

  const exportVideo = async () => {
    setIsExporting(true);

    try {
      toast.info(
        "Memulai export video... Ini mungkin memakan waktu beberapa menit."
      );

      await exportVideoBrowser();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Gagal export video: ${error.message}`);
      setIsExporting(false);
    }
  };

  const exportVideoBrowser = async () => {
    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    // Pre-load and cache image before rendering
    let cachedImage = null;
    if (imageUrl) {
      cachedImage = new Image();
      cachedImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        cachedImage.onload = resolve;
        cachedImage.onerror = reject;
        cachedImage.src = imageUrl;
      });
    }

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 5000000,
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    return new Promise((resolve) => {
      mediaRecorder.onstop = async () => {
        try {
          const webmBlob = new Blob(chunks, { type: "video/webm" });

          toast.info("Mengkonversi ke MP4...");

          const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");

          const ffmpeg = createFFmpeg({
            log: true,
            corePath:
              "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
          });
          await ffmpeg.load();

          ffmpeg.FS("writeFile", "input.webm", await fetchFile(webmBlob));
          await ffmpeg.run(
            "-i",
            "input.webm",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-aspect",
            "1:1",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "faststart",
            "output.mp4"
          );

          const data = ffmpeg.FS("readFile", "output.mp4");
          const mp4Blob = new Blob([data.buffer], { type: "video/mp4" });

          const url = window.URL.createObjectURL(mp4Blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `callout-label-${Date.now()}.mp4`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success("Video berhasil di-export!");
          setIsExporting(false);
          resolve();
        } catch (error) {
          console.error("Conversion error:", error);
          const webmBlob = new Blob(chunks, { type: "video/webm" });
          const url = window.URL.createObjectURL(webmBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `callout-label-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success(
            "Video berhasil di-export! (Format: WebM - konversi ke MP4 gagal)"
          );
          setIsExporting(false);
          resolve();
        }
      };

      mediaRecorder.start();

      const totalFrames = durationInFrames;
      const fps = 30;
      const frameDelay = 1000 / fps;

      // Calculate static positions (not affected by animation)
      const arrowMirrored = formValues.arrowMirrored || false;
      const markerX = arrowMirrored ? canvas.width - 60 : 60;
      const markerY = canvas.height - 60;
      const markerSize = formValues.markerSize || 12;
      const diagonalLength = formValues.diagonalLength ?? 600;
      const horizontalLength = formValues.horizontalLength ?? 400;
      const cornerX = markerX;
      const cornerY = markerY - diagonalLength;
      const lineEndX = arrowMirrored
        ? cornerX - horizontalLength
        : cornerX + horizontalLength;
      const lineEndY = cornerY;
      const textBoxWidth = 300;
      const textBoxHeight = 120;
      const textBoxX = lineEndX - textBoxWidth / 2;
      // Adjust textBoxY to be more aligned with arrow - move up slightly
      // Text box should be positioned so it's more aligned with the horizontal line end
      const textBoxY = cornerY - textBoxHeight + 30; // Move down 20px (moved up 10px from 30px)
      const imageWidth = 400;
      const imageHeight = 250;
      const imageGap = 20; // Increased from 25px to make spacing more renggang between image and text
      const imageX = textBoxX + textBoxWidth / 2 - imageWidth / 2;
      const imageY = textBoxY - imageHeight - imageGap;

      const renderFrame = async (frame) => {
        // Clear canvas
        ctx.fillStyle = formValues.backgroundColor || "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const currentTime = frame / fps;
        const { fadeIn, display, fadeOut } = formValues.animationSettings || {
          fadeIn: 1,
          display: 3,
          fadeOut: 1,
        };

        // Calculate animation progress
        const totalDuration = fadeIn + display + fadeOut;
        let progress = 0;

        if (currentTime < fadeIn) {
          progress = currentTime / fadeIn;
        } else if (currentTime < fadeIn + display) {
          progress = 1;
        } else if (currentTime < totalDuration) {
          progress = 1 - (currentTime - fadeIn - display) / fadeOut;
        } else {
          progress = 0;
        }

        // Apply animation
        let opacity = progress;
        let scale = 1;
        let translateY = 0;

        switch (formValues.animationType) {
          case "fade":
            opacity = progress;
            break;
          case "slideUp":
            opacity = progress;
            translateY = (1 - progress) * 50;
            break;
          case "slideDown":
            opacity = progress;
            translateY = (progress - 1) * 50;
            break;
          case "scale":
            opacity = progress;
            scale = progress;
            break;
          case "bounce":
            opacity = progress;
            scale = progress * (1 + Math.sin(progress * Math.PI * 4) * 0.1);
            break;
        }

        // Apply transformations for animated content (arrow, image, and text)
        // This ensures arrow and text box stay connected during scale animations
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2 + translateY);

        // Draw arrow and marker INSIDE transform so they scale with text box
        // Draw marker
        ctx.fillStyle = formValues.calloutColor || "#FF0000";
        ctx.fillRect(
          markerX - markerSize / 2,
          markerY - markerSize / 2,
          markerSize,
          markerSize
        );

        // Draw callout line
        ctx.strokeStyle = formValues.calloutColor || "#FF0000";
        ctx.lineWidth = formValues.lineThickness || 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(markerX, markerY);
        ctx.lineTo(cornerX, cornerY);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();

        // Draw image with border (inside transform)
        if (cachedImage) {
          // Calculate aspect ratio to maintain image proportions (cover behavior)
          const imageAspectRatio = cachedImage.width / cachedImage.height;
          const targetAspectRatio = imageWidth / imageHeight;

          let drawWidth = imageWidth;
          let drawHeight = imageHeight;
          let drawX = imageX;
          let drawY = imageY;

          if (imageAspectRatio > targetAspectRatio) {
            // Image is wider, fit to height
            drawHeight = imageHeight;
            drawWidth = imageHeight * imageAspectRatio;
            drawX = imageX + (imageWidth - drawWidth) / 2;
          } else {
            // Image is taller, fit to width
            drawWidth = imageWidth;
            drawHeight = imageWidth / imageAspectRatio;
            drawY = imageY + (imageHeight - drawHeight) / 2;
          }

          // Draw border
          ctx.strokeStyle = formValues.borderColor || "#FF0000";
          ctx.lineWidth = (formValues.borderThickness || 4) * 2;
          ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);

          // Draw image with cover behavior (centered and cropped)
          ctx.save();
          ctx.beginPath();
          ctx.rect(imageX, imageY, imageWidth, imageHeight);
          ctx.clip();
          ctx.drawImage(cachedImage, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();
        }

        // Draw text box INSIDE transform so it follows all animations including scale
        // Position is calculated to stay connected to arrow end point (lineEndX, lineEndY)
        // Text box X is centered on lineEndX, Y is above lineEndY
        const textSpacing = formValues.textSpacing || 8;
        const topTextFontSize = 48;
        const bottomTextFontSize = 42;
        const bottomTextPadding = 12; // padding: 12px 0 from preview

        // Calculate total content height (matches preview flexbox behavior)
        const bottomTextBgHeight = bottomTextFontSize + bottomTextPadding * 2;
        const totalContentHeight =
          topTextFontSize + textSpacing + bottomTextBgHeight;

        // Preview centers content vertically using justifyContent: center
        const actualContentHeight = totalContentHeight;
        const verticalOffset = (textBoxHeight - actualContentHeight) / 2;

        // Top text position - matching preview flexbox center alignment
        const topTextY = textBoxY + verticalOffset + topTextFontSize / 2;

        // Bottom text background position
        const bottomTextBgY =
          textBoxY + verticalOffset + topTextFontSize + textSpacing;
        // Bottom text is centered in its background (which has padding)
        const bottomTextY =
          bottomTextBgY + bottomTextPadding + bottomTextFontSize / 2;

        // Top text
        ctx.fillStyle = formValues.topTextColor || "#FF0000";
        ctx.font = `bold ${topTextFontSize}px "${
          formValues.fontFamily || "Arial"
        }", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          formValues.topText || "Kuningan PIK",
          textBoxX + textBoxWidth / 2,
          topTextY
        );

        // Bottom text background
        ctx.fillStyle = formValues.calloutColor || "#FF0000";
        ctx.fillRect(textBoxX, bottomTextBgY, textBoxWidth, bottomTextBgHeight);

        // Bottom text
        ctx.fillStyle = formValues.bottomTextColor || "#FFFFFF";
        ctx.font = `bold ${bottomTextFontSize}px "${
          formValues.fontFamily || "Arial"
        }", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          formValues.bottomText || "4 Menit",
          textBoxX + textBoxWidth / 2,
          bottomTextY
        );

        ctx.restore();
      };

      (async () => {
        for (let frame = 0; frame < totalFrames; frame++) {
          await renderFrame(frame);
          await new Promise((resolve) => setTimeout(resolve, frameDelay));
        }

        mediaRecorder.stop();
      })();
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-[1400px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm sm:text-base">Kembali ke Homepage</span>
        </Link>
      </div>
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
          Callout Label Video Generator
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Buat video animasi callout label untuk menunjukkan lokasi atau fitur
          tertentu
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] xl:grid-cols-[1fr_1fr] gap-4 sm:gap-6 lg:gap-8">
        <Form {...form}>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Konten
              </h2>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="topText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Top Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Kuningan PIK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bottomText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Bottom Text</FormLabel>
                      <FormControl>
                        <Input placeholder="4 Menit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="textSpacing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Jarak Antara Teks (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-sm">Upload Gambar</FormLabel>
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute left-[-9999px]"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-slate-700 font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      {imageFile ? imageFile.name : "Pilih gambar..."}
                    </label>
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="arrowMirrored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Mirror Arrow</FormLabel>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Warna
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="calloutColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Callout</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#FF0000"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="borderColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Border</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#FF0000"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topTextColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Top Text</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#FF0000"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bottomTextColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Warna Bottom Text
                      </FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#FFFFFF"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Warna Background
                      </FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#000000"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Border & Line
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="borderThickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Ketebalan Border (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lineThickness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Ketebalan Line (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="markerSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Ukuran Marker (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="5"
                          max="30"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 5)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagonalLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Panjang Garis Diagonal (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="2000"
                          step="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horizontalLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Panjang Garis Horizontal (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="2000"
                          step="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Animasi
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="animationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Jenis Animasi</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fade">Fade In/Out</SelectItem>
                          <SelectItem value="slideUp">Slide Up</SelectItem>
                          <SelectItem value="slideDown">Slide Down</SelectItem>
                          <SelectItem value="scale">Scale Up</SelectItem>
                          <SelectItem value="bounce">Bounce</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="animationSettings.fadeIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Fade In (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="animationSettings.display"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Display (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="animationSettings.fadeOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Fade Out (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Font
              </h3>

              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Font Family</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>
                              {font.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>

        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
              Preview
            </h3>
            <div
              className="bg-slate-900 rounded-xl mx-auto lg:mx-0 relative"
              style={{
                width: "100%",
                maxWidth: "400px",
                aspectRatio: "1/1",
                minHeight: "300px",
              }}
            >
              {formValues ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <Player
                    component={CalloutLabelVideo}
                    inputProps={{
                      imageUrl,
                      arrowMirrored: formValues.arrowMirrored,
                      topText: formValues.topText,
                      bottomText: formValues.bottomText,
                      calloutColor: formValues.calloutColor,
                      borderColor: formValues.borderColor,
                      borderThickness: formValues.borderThickness,
                      lineThickness: formValues.lineThickness,
                      markerSize: formValues.markerSize,
                      backgroundColor: formValues.backgroundColor,
                      topTextColor: formValues.topTextColor,
                      bottomTextColor: formValues.bottomTextColor,
                      animationType: formValues.animationType,
                      animationSettings: formValues.animationSettings,
                      fontFamily: formValues.fontFamily,
                      textSpacing: formValues.textSpacing,
                      diagonalLength: formValues.diagonalLength,
                      horizontalLength: formValues.horizontalLength,
                    }}
                    durationInFrames={Math.max(durationInFrames, 30)}
                    fps={30}
                    compositionWidth={1080}
                    compositionHeight={1080}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    controls
                    loop
                    autoPlay
                  />
                </div>
              ) : (
                <div
                  className="text-white text-center flex items-center justify-center"
                  style={{ width: "100%", height: "100%", minHeight: "300px" }}
                >
                  <p>Loading preview...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4 sm:mt-6">
              <Button
                onClick={exportVideo}
                disabled={isExporting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg text-sm sm:text-base"
              >
                {isExporting ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Video
                  </>
                )}
              </Button>
            </div>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-600">
                <strong>Durasi:</strong> {calculateTotalDuration().toFixed(1)}{" "}
                detik
                <br />
                <strong>Resolusi:</strong> 1080x1080 (1:1)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalloutLabelGenerator;
