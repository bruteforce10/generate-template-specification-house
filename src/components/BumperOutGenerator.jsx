import React, { useState, useEffect, useCallback } from "react";
import { Player } from "@remotion/player";
import { Link } from "react-router-dom";
import { Upload, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import BumperOutVideo from "./BumperOutVideo";
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
  nameText: z.string().min(1, "Name text harus diisi"),
  phoneNumber: z.string().min(1, "Phone number harus diisi"),
  showWhatsAppIcon: z.boolean(),
  backgroundColor: z.string(),
  cardBackgroundColor: z.string(),
  cardWidth: z.number().min(400).max(1000),
  cardBorderRadius: z.number().min(0).max(100),
  cardPadding: z.number().min(0).max(100),
  cardGap: z.number().min(0).max(100),
  profileImageSize: z.number().min(20).max(200),
  profileImageBorderRadius: z.number().min(0).max(100),
  topTextSize: z.number().min(8).max(72),
  topTextColor: z.string(),
  nameTextSize: z.number().min(8).max(72),
  nameTextColor: z.string(),
  phoneTextSize: z.number().min(8).max(72),
  phoneTextColor: z.string(),
  phoneIconSize: z.number().min(8).max(48),
  phoneIconColor: z.string(),
  animationType: z.enum(["fade", "slideUp", "slideDown", "scale", "bounce"]),
  animationSettings: z.object({
    fadeIn: z.number().min(0),
    display: z.number().min(0),
    fadeOut: z.number().min(0),
  }),
  fontFamily: z.string(),
});

const BumperOutGenerator = () => {
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topText: "More info & Private Viewing",
      nameText: "Reina Tan",
      phoneNumber: "0895 0904 6152",
      showWhatsAppIcon: true,
      backgroundColor: "#2D2D2D",
      cardBackgroundColor: "#FFFFFF",
      cardWidth: 800,
      cardBorderRadius: 20,
      cardPadding: 24,
      cardGap: 20,
      profileImageSize: 80,
      profileImageBorderRadius: 50,
      topTextSize: 14,
      topTextColor: "#000000",
      nameTextSize: 24,
      nameTextColor: "#000000",
      phoneTextSize: 14,
      phoneTextColor: "#000000",
      phoneIconSize: 16,
      phoneIconColor: "#25D366",
      animationType: "fade",
      animationSettings: {
        fadeIn: 1,
        display: 3,
        fadeOut: 1,
      },
      fontFamily: "Arial",
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

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setProfileImageFile(file);
        setProfileImageUrl(url);
        toast.success("Gambar profil berhasil diupload");
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

    // Pre-load and cache profile image before rendering
    let cachedProfileImage = null;
    if (profileImageUrl) {
      cachedProfileImage = new Image();
      cachedProfileImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        cachedProfileImage.onload = resolve;
        cachedProfileImage.onerror = reject;
        cachedProfileImage.src = profileImageUrl;
      });
    }

    // Pre-load and cache WhatsApp icon SVG
    let cachedWhatsAppIcon = null;
    if (formValues.showWhatsAppIcon) {
      const phoneIconSize = formValues.phoneIconSize || 16;
      const phoneIconColor = formValues.phoneIconColor || "#25D366";
      const svgString = `<svg width="${phoneIconSize}" height="${phoneIconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${phoneIconColor}" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>`;
      
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      cachedWhatsAppIcon = new Image();
      await new Promise((resolve, reject) => {
        cachedWhatsAppIcon.onload = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        cachedWhatsAppIcon.onerror = reject;
        cachedWhatsAppIcon.src = url;
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
          a.download = `bumper-out-${Date.now()}.mp4`;
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
          a.download = `bumper-out-${Date.now()}.webm`;
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

      // Calculate static positions
      const canvasWidth = 1080;
      const canvasHeight = 1080;
      const cardWidth = formValues.cardWidth || 800;
      const cardHeight = 120;
      const cardX = (canvasWidth - cardWidth) / 2;
      const cardY = (canvasHeight - cardHeight) / 2;
      const cardPadding = formValues.cardPadding || 24;
      const cardGap = formValues.cardGap || 20;
      const profileImageSize = formValues.profileImageSize || 80;
      const profileX = cardX + cardPadding;
      const profileY = cardY + cardHeight / 2;

      const renderFrame = async (frame) => {
        // Clear canvas
        ctx.fillStyle = formValues.backgroundColor || "#2D2D2D";
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

        // Apply transformations for animated content
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2 + translateY);

        // Draw card background with rounded corners
        const borderRadius = formValues.cardBorderRadius || 20;
        ctx.fillStyle = formValues.cardBackgroundColor || "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(cardX + borderRadius, cardY);
        ctx.lineTo(cardX + cardWidth - borderRadius, cardY);
        ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + borderRadius);
        ctx.lineTo(cardX + cardWidth, cardY + cardHeight - borderRadius);
        ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - borderRadius, cardY + cardHeight);
        ctx.lineTo(cardX + borderRadius, cardY + cardHeight);
        ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - borderRadius);
        ctx.lineTo(cardX, cardY + borderRadius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + borderRadius, cardY);
        ctx.closePath();
        ctx.fill();

        // Draw profile image with cover behavior to maintain aspect ratio
        if (cachedProfileImage) {
          const profileImageBorderRadius = formValues.profileImageBorderRadius || 50;
          const profileImageX = profileX - profileImageSize / 2;
          const profileImageY = profileY - profileImageSize / 2;

          // Calculate aspect ratio to maintain image proportions (cover behavior)
          const imageAspectRatio = cachedProfileImage.width / cachedProfileImage.height;
          const targetAspectRatio = 1; // Square for circular image
          
          let drawWidth = profileImageSize;
          let drawHeight = profileImageSize;
          let drawX = profileImageX;
          let drawY = profileImageY;
          
          if (imageAspectRatio > targetAspectRatio) {
            // Image is wider, fit to height
            drawHeight = profileImageSize;
            drawWidth = profileImageSize * imageAspectRatio;
            drawX = profileImageX - (drawWidth - profileImageSize) / 2;
          } else {
            // Image is taller, fit to width
            drawWidth = profileImageSize;
            drawHeight = profileImageSize / imageAspectRatio;
            drawY = profileImageY - (drawHeight - profileImageSize) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(
            profileX,
            profileY,
            profileImageSize / 2,
            0,
            Math.PI * 2
          );
          ctx.clip();
          ctx.drawImage(
            cachedProfileImage,
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
          ctx.restore();
        }

        // Draw text container - matching preview layout
        const textContainerX = profileX + profileImageSize / 2 + cardGap;
        const textContainerY = cardY + cardPadding;
        const textContainerWidth = cardWidth - cardPadding * 2 - profileImageSize - cardGap;

        // Top text - matching preview (lineHeight: 1.2)
        ctx.fillStyle = formValues.topTextColor || "#000000";
        ctx.font = `${formValues.topTextSize || 14}px "${
          formValues.fontFamily || "Arial"
        }", sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const topTextY = textContainerY;
        ctx.fillText(
          formValues.topText || "More info & Private Viewing",
          textContainerX,
          topTextY
        );

        // Name text - matching preview (lineHeight: 1.2, gap: 4px)
        const topTextHeight = (formValues.topTextSize || 14) * 1.2;
        const nameTextY = topTextY + topTextHeight + 4;
        ctx.fillStyle = formValues.nameTextColor || "#000000";
        ctx.font = `bold ${formValues.nameTextSize || 24}px "${
          formValues.fontFamily || "Arial"
        }", sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(
          formValues.nameText || "Reina Tan",
          textContainerX,
          nameTextY
        );

        // Phone number with icon - matching preview (lineHeight: 1.2, gap: 4px, gap icon: 6px)
        const nameTextHeight = (formValues.nameTextSize || 24) * 1.2;
        const phoneTextY = nameTextY + nameTextHeight + 4;
        const phoneIconSize = formValues.phoneIconSize || 16;

        // Phone number with icon - matching preview alignment
        const phoneTextBaselineY = phoneTextY + (formValues.phoneTextSize || 14) * 1.2 / 2;
        
        if (formValues.showWhatsAppIcon && cachedWhatsAppIcon) {
          // Draw cached WhatsApp icon
          const iconX = textContainerX;
          const iconY = phoneTextBaselineY - phoneIconSize / 2;
          ctx.drawImage(cachedWhatsAppIcon, iconX, iconY, phoneIconSize, phoneIconSize);
        }

        // Phone number text - matching preview (aligned with icon center)
        const phoneTextX = textContainerX + (formValues.showWhatsAppIcon ? phoneIconSize + 6 : 0);
        ctx.fillStyle = formValues.phoneTextColor || "#000000";
        ctx.font = `${formValues.phoneTextSize || 14}px "${
          formValues.fontFamily || "Arial"
        }", sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          formValues.phoneNumber || "0895 0904 6152",
          phoneTextX,
          phoneTextBaselineY
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
          Bumper Out Video Generator
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Buat video card kontak dengan profil, nama, dan nomor telepon
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
                <FormItem>
                  <FormLabel className="text-sm">Upload Gambar Profil</FormLabel>
                  <div className="relative">
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="absolute left-[-9999px]"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-slate-700 font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      {profileImageFile
                        ? profileImageFile.name
                        : "Pilih gambar profil..."}
                    </label>
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="topText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Top Text</FormLabel>
                      <FormControl>
                        <Input placeholder="More info & Private Viewing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="Reina Tan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="0895 0904 6152" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showWhatsAppIcon"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Tampilkan Icon WhatsApp</FormLabel>
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
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Background</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#2D2D2D"
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
                  name="cardBackgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Card</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer shrink-0"
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
                  name="topTextColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Top Text</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer shrink-0"
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

                <FormField
                  control={form.control}
                  name="nameTextColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Nama</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer shrink-0"
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

                <FormField
                  control={form.control}
                  name="phoneTextColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Nomor Telepon</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer shrink-0"
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

                <FormField
                  control={form.control}
                  name="phoneIconColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Warna Icon WhatsApp</FormLabel>
                      <div className="flex gap-2 sm:gap-4 items-center">
                        <input
                          type="color"
                          {...field}
                          className="w-12 h-10 sm:w-16 border-2 border-slate-200 rounded-lg cursor-pointer shrink-0"
                        />
                        <FormControl>
                          <Input
                            placeholder="#25D366"
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
                Ukuran & Spacing
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Lebar Card (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="400"
                          max="1000"
                          step="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 800)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImageSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Ukuran Gambar Profil (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="20"
                          max="200"
                          step="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 80)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImageBorderRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Border Radius Profil (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 50)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardBorderRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Border Radius Card (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 20)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardPadding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Padding Card (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="2"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 24)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardGap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Jarak Profil ke Text (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="2"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 20)
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
                Font Size
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="topTextSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Ukuran Top Text (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 14)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameTextSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Ukuran Nama (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 24)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneTextSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Ukuran Nomor Telepon (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 14)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneIconSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Ukuran Icon WhatsApp (px)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="8"
                          max="48"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 16)
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
                    component={BumperOutVideo}
                    inputProps={{
                      profileImageUrl,
                      topText: formValues.topText,
                      nameText: formValues.nameText,
                      phoneNumber: formValues.phoneNumber,
                      showWhatsAppIcon: formValues.showWhatsAppIcon,
                      backgroundColor: formValues.backgroundColor,
                      cardBackgroundColor: formValues.cardBackgroundColor,
                      cardWidth: formValues.cardWidth,
                      cardBorderRadius: formValues.cardBorderRadius,
                      cardPadding: formValues.cardPadding,
                      cardGap: formValues.cardGap,
                      profileImageSize: formValues.profileImageSize,
                      profileImageBorderRadius: formValues.profileImageBorderRadius,
                      topTextSize: formValues.topTextSize,
                      topTextColor: formValues.topTextColor,
                      nameTextSize: formValues.nameTextSize,
                      nameTextColor: formValues.nameTextColor,
                      phoneTextSize: formValues.phoneTextSize,
                      phoneTextColor: formValues.phoneTextColor,
                      phoneIconSize: formValues.phoneIconSize,
                      phoneIconColor: formValues.phoneIconColor,
                      animationType: formValues.animationType,
                      animationSettings: formValues.animationSettings,
                      fontFamily: formValues.fontFamily,
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

export default BumperOutGenerator;

