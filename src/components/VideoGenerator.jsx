import React, { useState, useEffect, useCallback } from "react";
import { Player } from "@remotion/player";
import { Link } from "react-router-dom";
import {
  Bed,
  Home,
  Bath,
  Car,
  Trees,
  MapPin,
  DollarSign,
  Calendar,
  X,
  Upload,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PropertyVideo from "./PropertyVideo";
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

const ICON_OPTIONS = [
  { value: "bed", label: "Bed", icon: Bed },
  { value: "home", label: "Home", icon: Home },
  { value: "bath", label: "Bath", icon: Bath },
  { value: "car", label: "Car", icon: Car },
  { value: "trees", label: "Trees", icon: Trees },
  { value: "map", label: "Map", icon: MapPin },
  { value: "dollar", label: "Dollar", icon: DollarSign },
  { value: "calendar", label: "Calendar", icon: Calendar },
];

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

const specSchema = z.object({
  icon: z.string(),
  title: z.string(),
  subtitle: z.string(),
});

const formSchema = z.object({
  specs: z.array(specSchema).min(1).max(4),
  animationMode: z.enum(["bersamaan", "berurutan"]),
  animationType: z.enum([
    "fade",
    "slideUp",
    "slideDown",
    "slideLeft",
    "slideRight",
    "scale",
    "bounce",
    "rotate",
  ]),
  animationSettings: z.object({
    fadeIn: z.number().min(0),
    display: z.number().min(0),
    fadeOut: z.number().min(0),
  }),
  spacing: z.number().min(0).max(200),
  backgroundType: z.enum(["color", "video"]),
  backgroundColor: z.string(),
  titleFont: z.string(),
  subtitleFont: z.string(),
});

const VideoGenerator = () => {
  const [backgroundVideo, setBackgroundVideo] = useState(null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specs: [
        { icon: "bed", title: "2+1", subtitle: "Kamar Tidur" },
        { icon: "home", title: "45", subtitle: "M² Luas" },
        { icon: "bath", title: "2+1", subtitle: "Kamar Mandi" },
      ],
      animationMode: "bersamaan",
      animationType: "fade",
      animationSettings: {
        fadeIn: 1,
        display: 3,
        fadeOut: 1,
      },
      spacing: 40,
      backgroundType: "color",
      backgroundColor: "#000000",
      titleFont: "Space Grotesk",
      subtitleFont: "Inter",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specs",
  });

  const specs = form.watch("specs");
  const animationMode = form.watch("animationMode");
  const animationType = form.watch("animationType");
  const animationSettings = form.watch("animationSettings");
  const spacing = form.watch("spacing");
  const backgroundType = form.watch("backgroundType");
  const backgroundColor = form.watch("backgroundColor");
  const titleFont = form.watch("titleFont");
  const subtitleFont = form.watch("subtitleFont");

  const calculateTotalDuration = useCallback(() => {
    if (animationMode === "bersamaan") {
      return (
        animationSettings.fadeIn +
        animationSettings.display +
        animationSettings.fadeOut
      );
    } else {
      const totalFadeIn = animationSettings.fadeIn * specs.length;
      return (
        totalFadeIn + animationSettings.display + animationSettings.fadeOut
      );
    }
  }, [animationMode, animationSettings, specs.length]);

  const [durationInFrames, setDurationInFrames] = useState(
    calculateTotalDuration() * 30
  );

  useEffect(() => {
    setDurationInFrames(Math.ceil(calculateTotalDuration() * 30));
  }, [animationSettings, specs, animationMode, calculateTotalDuration]);

  const addSpec = () => {
    if (specs.length >= 4) {
      toast.error("Maksimal 4 spesifikasi");
      return;
    }
    append({ icon: "home", title: "", subtitle: "" });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setBackgroundVideo(file);
        setBackgroundVideoUrl(url);
        toast.success("Video berhasil diupload");
      } else {
        toast.error("File harus berupa video");
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
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    const numSpecs = specs.length;
    let iconSize, titleSize, subtitleSize, itemGap;
    switch (numSpecs) {
      case 1:
        iconSize = 160;
        titleSize = 140;
        subtitleSize = 70;
        itemGap = 50;
        break;
      case 2:
        iconSize = 140;
        titleSize = 120;
        subtitleSize = 60;
        itemGap = 45;
        break;
      case 3:
        iconSize = 100;
        titleSize = 90;
        subtitleSize = 45;
        itemGap = 35;
        break;
      case 4:
        iconSize = 80;
        titleSize = 70;
        subtitleSize = 35;
        itemGap = 25;
        break;
      default:
        iconSize = 100;
        titleSize = 90;
        subtitleSize = 45;
        itemGap = 35;
    }

    const itemWidth = iconSize * 1.5;
    const totalWidth = itemWidth * numSpecs + spacing * (numSpecs - 1);
    let scale = 1;
    const maxWidth = 1000;
    if (totalWidth > maxWidth) {
      scale = maxWidth / totalWidth;
    }

    const renderIconToImage = async (spec, iconSize) => {
      const IconComponent = getIconComponent(spec.icon);
      const svgString = React.createElement(IconComponent, {
        size: iconSize,
        strokeWidth: 2,
        color: "white",
      });

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = `${iconSize}px`;
      tempDiv.style.height = `${iconSize}px`;
      document.body.appendChild(tempDiv);

      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempDiv);
      root.render(
        React.createElement("div", { style: { color: "white" } }, svgString)
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const svgElement = tempDiv.querySelector("svg");
      if (!svgElement) {
        document.body.removeChild(tempDiv);
        root.unmount();
        return null;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(url);
          document.body.removeChild(tempDiv);
          root.unmount();
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      return img;
    };

    toast.info("Mempersiapkan icon...");
    const iconImages = await Promise.all(
      specs.map((spec) => renderIconToImage(spec, iconSize))
    );

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
          a.download = `property-video-${Date.now()}.mp4`;
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
          a.download = `property-video-${Date.now()}.webm`;
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

      const renderFrame = async (frame) => {
        if (backgroundType === "color") {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (backgroundType === "video" && backgroundVideoUrl) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const currentTime = frame / fps;
        const { fadeIn, display, fadeOut } = animationSettings;

        const scaledTotalWidth = totalWidth * scale;
        const startX = (canvas.width - scaledTotalWidth) / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < specs.length; i++) {
          let opacity = 1;
          let offsetX = 0;
          let offsetY = 0;
          let scaleAnim = 1;

          let progress = 0;
          if (animationMode === "bersamaan") {
            const totalDuration = fadeIn + display + fadeOut;
            if (currentTime < fadeIn) {
              progress = currentTime / fadeIn;
            } else if (currentTime < fadeIn + display) {
              progress = 1;
            } else if (currentTime < totalDuration) {
              progress = 1 - (currentTime - fadeIn - display) / fadeOut;
            } else {
              progress = 0;
            }
          } else {
            const startTime = i * fadeIn;
            const allAppearedTime = specs.length * fadeIn;
            const fadeOutStartTime = allAppearedTime + display;
            const totalDuration = fadeOutStartTime + fadeOut;

            if (currentTime < startTime) {
              progress = 0;
            } else if (currentTime < startTime + fadeIn) {
              progress = (currentTime - startTime) / fadeIn;
            } else if (currentTime < fadeOutStartTime) {
              progress = 1;
            } else if (currentTime < totalDuration) {
              progress = 1 - (currentTime - fadeOutStartTime) / fadeOut;
            } else {
              progress = 0;
            }
          }

          switch (animationType) {
            case "fade":
              opacity = progress;
              break;
            case "slideUp":
              opacity = progress;
              offsetY = (1 - progress) * 100;
              break;
            case "slideDown":
              opacity = progress;
              offsetY = (progress - 1) * 100;
              break;
            case "slideLeft":
              opacity = progress;
              offsetX = (progress - 1) * 100;
              break;
            case "slideRight":
              opacity = progress;
              offsetX = (1 - progress) * 100;
              break;
            case "scale":
              opacity = progress;
              scaleAnim = progress;
              break;
            default:
              opacity = progress;
          }

          const x =
            startX +
            i * (itemWidth * scale + spacing * scale) +
            (itemWidth * scale) / 2 +
            offsetX;
          const y = centerY + offsetY;

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.translate(x, y);
          ctx.scale(scaleAnim, scaleAnim);

          const subtitleText = specs[i].subtitle;
          const maxSubtitleWidth = itemWidth;

          ctx.font = `${subtitleSize}px "${subtitleFont}", "Arial", sans-serif`;
          const metrics = ctx.measureText(subtitleText);

          let subtitleHeight = subtitleSize;
          let subtitleLines = [subtitleText];

          if (metrics.width > maxSubtitleWidth) {
            const words = subtitleText.split(" ");
            const lines = [];
            let currentLine = "";

            for (let n = 0; n < words.length; n++) {
              const word = words[n];
              const wordMetrics = ctx.measureText(word);

              if (wordMetrics.width > maxSubtitleWidth) {
                if (currentLine) {
                  lines.push(currentLine.trim());
                  currentLine = word;
                } else {
                  currentLine = word;
                }
              } else {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testMetrics = ctx.measureText(testLine);

                if (testMetrics.width > maxSubtitleWidth && currentLine) {
                  lines.push(currentLine.trim());
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              }
            }

            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }

            subtitleLines = lines;
            const lineHeight = subtitleSize * 1.2;
            subtitleHeight = subtitleSize + (lines.length - 1) * lineHeight;
          }

          const totalHeight =
            iconSize + itemGap + titleSize + itemGap * 0.3 + subtitleHeight;
          const topY = -totalHeight / 2;

          const iconY = topY + iconSize / 2;
          const titleY = topY + iconSize + itemGap + titleSize / 2;
          const subtitleY =
            topY +
            iconSize +
            itemGap +
            titleSize +
            itemGap * 0.3 +
            subtitleHeight / 2;

          if (iconImages[i]) {
            const iconX = -iconSize / 2;
            const iconDrawY = iconY - iconSize / 2;
            ctx.drawImage(iconImages[i], iconX, iconDrawY, iconSize, iconSize);
          }

          ctx.fillStyle = "white";
          ctx.font = `bold ${titleSize}px "${titleFont}", "Arial", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(specs[i].title, 0, titleY);

          ctx.font = `${subtitleSize}px "${subtitleFont}", "Arial", sans-serif`;
          ctx.globalAlpha = opacity * 0.9;

          if (subtitleLines.length === 1) {
            ctx.fillText(subtitleLines[0], 0, subtitleY);
          } else {
            const lineHeight = subtitleSize * 1.2;
            const totalTextHeight =
              subtitleSize + (subtitleLines.length - 1) * lineHeight;
            const firstLineTop = subtitleY - totalTextHeight / 2;
            const firstLineY = firstLineTop + subtitleSize / 2;

            subtitleLines.forEach((line, lineIndex) => {
              if (lineIndex === 0) {
                ctx.fillText(line, 0, firstLineY);
              } else {
                const lineY =
                  firstLineTop +
                  subtitleSize +
                  (lineIndex - 1) * lineHeight +
                  subtitleSize / 2;
                ctx.fillText(line, 0, lineY);
              }
            });
          }

          ctx.restore();
        }
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

  const getIconComponent = (iconName) => {
    const iconObj = ICON_OPTIONS.find((i) => i.value === iconName);
    return iconObj ? iconObj.icon : Home;
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
          Property Spec Video Generator
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Buat video spesifikasi properti dengan mudah
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] xl:grid-cols-[1fr_1fr] gap-4 sm:gap-6 lg:gap-8">
        <Form {...form}>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Spesifikasi Properti
              </h2>

              {fields.map((field, index) => (
                <div key={field.id} className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_1fr_auto] gap-3 sm:gap-4 items-end p-3 sm:p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                    <FormField
                      control={form.control}
                      name={`specs.${index}.icon`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-1">
                          <FormLabel className="text-sm">Ikon</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ICON_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div className="flex items-center gap-2">
                                    <opt.icon className="w-4 h-4" />
                                    {opt.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`specs.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-1">
                          <FormLabel className="text-sm">Title</FormLabel>
                          <FormControl>
                            <Input placeholder="2+1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`specs.${index}.subtitle`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-1">
                          <FormLabel className="text-sm">Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Kamar Tidur" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 sm:col-span-1 justify-self-end sm:justify-self-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {specs.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSpec}
                  className="w-full"
                >
                  + Tambah Spesifikasi
                </Button>
              )}
            </div>

            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Animasi
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="animationMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Mode Animasi</FormLabel>
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
                          <SelectItem value="bersamaan">Bersamaan</SelectItem>
                          <SelectItem value="berurutan">Berurutan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="slideLeft">Slide Left</SelectItem>
                          <SelectItem value="slideRight">
                            Slide Right
                          </SelectItem>
                          <SelectItem value="scale">Scale Up</SelectItem>
                          <SelectItem value="bounce">Bounce</SelectItem>
                          <SelectItem value="rotate">Rotate</SelectItem>
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

                <FormField
                  control={form.control}
                  name="spacing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Jarak Antar Spesifikasi (px)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="200"
                          step="5"
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
                Background
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="backgroundType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Tipe Background</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "color") {
                            setBackgroundVideoUrl(null);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="color">Solid Color</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {backgroundType === "color" && (
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
                )}

                {backgroundType === "video" && (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Upload Video Background
                    </FormLabel>
                    <div className="relative">
                      <input
                        type="file"
                        id="video-upload"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="absolute left-[-9999px]"
                      />
                      <label
                        htmlFor="video-upload"
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-slate-700 font-medium"
                      >
                        <Upload className="w-5 h-5" />
                        {backgroundVideo
                          ? backgroundVideo.name
                          : "Pilih video..."}
                      </label>
                    </div>
                  </FormItem>
                )}
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-900">
                Font
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="titleFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Font Title</FormLabel>
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

                <FormField
                  control={form.control}
                  name="subtitleFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Font Subtitle</FormLabel>
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
                aspectRatio: "9/16",
                minHeight: "300px",
              }}
            >
              {specs && specs.length > 0 && animationSettings ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <Player
                    component={PropertyVideo}
                    inputProps={{
                      specs,
                      backgroundType,
                      backgroundColor,
                      backgroundVideoUrl,
                      getIconComponent,
                      spacing,
                      animationSettings,
                      animationMode,
                      animationType,
                      titleFont,
                      subtitleFont,
                    }}
                    durationInFrames={Math.max(durationInFrames, 30)}
                    fps={30}
                    compositionWidth={1080}
                    compositionHeight={1920}
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
                data-testid="export-video-btn"
              >
                {isExporting ? "Exporting..." : "Export Video"}
              </Button>
            </div>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-600">
                <strong>Durasi:</strong> {calculateTotalDuration().toFixed(1)}{" "}
                detik
                <br />
                <strong>Resolusi:</strong> 1080x1920 (9:16)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
