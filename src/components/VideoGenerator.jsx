import React, { useState, useEffect, useCallback } from "react";
import { Player } from "@remotion/player";
import {
  Bed,
  Home,
  Bath,
  Car,
  Trees,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import PropertyVideo from "./PropertyVideo";

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

const VideoGenerator = () => {
  const [specs, setSpecs] = useState([
    { icon: "bed", title: "2+1", subtitle: "Kamar Tidur" },
    { icon: "home", title: "45", subtitle: "M² Luas" },
    { icon: "bath", title: "2+1", subtitle: "Kamar Mandi" },
  ]);

  const [backgroundType, setBackgroundType] = useState("color");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundVideo, setBackgroundVideo] = useState(null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [spacing, setSpacing] = useState(40);
  const [animationMode, setAnimationMode] = useState("bersamaan"); // 'bersamaan' or 'berurutan'
  const [animationType, setAnimationType] = useState("fade"); // 'fade', 'slideUp', 'slideLeft', 'slideRight', 'scale', 'bounce', 'rotate'
  const [animationSettings, setAnimationSettings] = useState({
    fadeIn: 1,
    display: 3,
    fadeOut: 1,
  });

  const calculateTotalDuration = useCallback(() => {
    if (animationMode === "bersamaan") {
      return (
        animationSettings.fadeIn +
        animationSettings.display +
        animationSettings.fadeOut
      );
    } else {
      // berurutan: each spec appears one by one, then all stay visible, then all fade out together
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
    setSpecs([
      ...specs,
      {
        icon: "home",
        title: "",
        subtitle: "",
      },
    ]);
  };

  const removeSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
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

      // Use browser-based export using canvas recording
      await exportVideoBrowser();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Gagal export video: ${error.message}`);
      setIsExporting(false);
    }
  };

  const exportVideoBrowser = async () => {
    // Create a canvas for rendering
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // Calculate sizing based on number of specs (same as PropertyVideo)
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

    // Pre-render icons to images
    const renderIconToImage = async (spec, iconSize) => {
      const IconComponent = getIconComponent(spec.icon);
      const svgString = React.createElement(IconComponent, {
        size: iconSize,
        strokeWidth: 2,
        color: "white",
      });

      // Create a temporary SVG element
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = `${iconSize}px`;
      tempDiv.style.height = `${iconSize}px`;
      document.body.appendChild(tempDiv);

      // Render React component to DOM
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempDiv);
      root.render(
        React.createElement("div", { style: { color: "white" } }, svgString)
      );

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Convert to image
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

    // Create MediaRecorder for video export
    const stream = canvas.captureStream(30); // 30 fps
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

          // Convert WebM to MP4 using ffmpeg.wasm
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

          // Download the MP4 file
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
          // Fallback: download as WebM
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

      // Start recording
      mediaRecorder.start();

      // Render frames to canvas
      const totalFrames = durationInFrames;
      const fps = 30;
      const frameDelay = 1000 / fps;

      // Render each frame
      const renderFrame = async (frame) => {
        // Draw background
        if (backgroundType === "color") {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (backgroundType === "video" && backgroundVideoUrl) {
          // Draw video background (simplified - just draw color for now)
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Calculate current time
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

          // Calculate animation progress
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

          // Apply animation type
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

          // First, calculate subtitle height dynamically (before calculating positions)
          // This ensures spacing is correct for both single and multi-line subtitles
          // IMPORTANT: maxSubtitleWidth must match PropertyVideo's maxWidth (itemWidth)
          // PropertyVideo uses maxWidth: itemWidth (not scaled), so we use itemWidth too
          const subtitleText = specs[i].subtitle;
          const maxSubtitleWidth = itemWidth; // Same as PropertyVideo, no scale applied

          ctx.font = `${subtitleSize}px "Inter", "Arial", sans-serif`;
          const metrics = ctx.measureText(subtitleText);

          let subtitleHeight = subtitleSize; // Default for single line
          let subtitleLines = [subtitleText];

          if (metrics.width > maxSubtitleWidth) {
            // Multi-line: wrap text per kata (bukan per huruf)
            // Split by space to get words, then wrap each word
            const words = subtitleText.split(" ");
            const lines = [];
            let currentLine = "";

            for (let n = 0; n < words.length; n++) {
              const word = words[n];
              // Measure single word (without space) to check if it fits
              const wordMetrics = ctx.measureText(word);

              // If single word is too long, still add it (better than breaking)
              if (wordMetrics.width > maxSubtitleWidth) {
                // Word is too long, but we'll still add it to avoid breaking
                if (currentLine) {
                  lines.push(currentLine.trim());
                  currentLine = word;
                } else {
                  currentLine = word;
                }
              } else {
                // Try adding word with space
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testMetrics = ctx.measureText(testLine);

                if (testMetrics.width > maxSubtitleWidth && currentLine) {
                  // Current line + word exceeds width, start new line
                  lines.push(currentLine.trim());
                  currentLine = word;
                } else {
                  // Can fit, add to current line
                  currentLine = testLine;
                }
              }
            }

            // Add remaining line
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }

            subtitleLines = lines;
            // Multi-line height: first line (subtitleSize) + subsequent lines (lineHeight * 1.2)
            const lineHeight = subtitleSize * 1.2;
            subtitleHeight = subtitleSize + (lines.length - 1) * lineHeight;
          }

          // Now calculate positions based on dynamic subtitle height
          // PropertyVideo structure:
          // - Container: flexDirection: column, alignItems: center, gap: itemGap
          // - Icon div (height: iconSize)
          // - Gap: itemGap
          // - Title (height: titleSize, lineHeight: 1)
          // - marginBottom: itemGap * 0.3
          // - Subtitle (height: subtitleHeight - dynamic based on lines)
          //
          // Total height: iconSize + itemGap + titleSize + (itemGap * 0.3) + subtitleHeight
          const totalHeight =
            iconSize + itemGap + titleSize + itemGap * 0.3 + subtitleHeight;
          const topY = -totalHeight / 2;

          // Icon: top element, center Y position
          const iconY = topY + iconSize / 2;

          // Title: after icon + gap, center Y position
          const titleY = topY + iconSize + itemGap + titleSize / 2;

          // Subtitle: after title + marginBottom, center Y position (using dynamic height)
          const subtitleY =
            topY +
            iconSize +
            itemGap +
            titleSize +
            itemGap * 0.3 +
            subtitleHeight / 2;

          // Draw icon (centered horizontally and vertically)
          if (iconImages[i]) {
            const iconX = -iconSize / 2;
            const iconDrawY = iconY - iconSize / 2;
            ctx.drawImage(iconImages[i], iconX, iconDrawY, iconSize, iconSize);
          }

          // Draw title with proper font (centered)
          ctx.fillStyle = "white";
          ctx.font = `bold ${titleSize}px "Space Grotesk", "Arial", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(specs[i].title, 0, titleY);

          // Draw subtitle with proper font
          ctx.font = `${subtitleSize}px "Inter", "Arial", sans-serif`;
          ctx.globalAlpha = opacity * 0.9;

          if (subtitleLines.length === 1) {
            // Single line - draw directly at center
            ctx.fillText(subtitleLines[0], 0, subtitleY);
          } else {
            // Multi-line: draw each line with proper spacing
            const lineHeight = subtitleSize * 1.2;
            // Calculate top of first line so entire block is centered at subtitleY
            const totalTextHeight =
              subtitleSize + (subtitleLines.length - 1) * lineHeight;
            const firstLineTop = subtitleY - totalTextHeight / 2;
            const firstLineY = firstLineTop + subtitleSize / 2;

            subtitleLines.forEach((line, lineIndex) => {
              if (lineIndex === 0) {
                ctx.fillText(line, 0, firstLineY);
              } else {
                // Subsequent lines: firstLineTop + subtitleSize + spacing
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

      // Render all frames
      (async () => {
        for (let frame = 0; frame < totalFrames; frame++) {
          await renderFrame(frame);
          await new Promise((resolve) => setTimeout(resolve, frameDelay));
        }

        // Stop recording
        mediaRecorder.stop();
      })();
    });
  };

  const getIconComponent = (iconName) => {
    const iconObj = ICON_OPTIONS.find((i) => i.value === iconName);
    return iconObj ? iconObj.icon : Home;
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Property Spec Video Generator</h1>
        <p>Buat video spesifikasi properti dengan mudah</p>
      </div>

      <div className="main-content">
        <div className="card form-section">
          <div>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
              Spesifikasi Properti
            </h2>

            {specs.map((spec, index) => (
              <div key={index} style={{ marginBottom: "1.5rem" }}>
                <div
                  className="spec-item"
                  style={{ gridTemplateColumns: "100px 1fr 1fr auto" }}
                >
                  <div className="form-group">
                    <label>Ikon</label>
                    <select
                      className="select"
                      value={spec.icon}
                      onChange={(e) =>
                        updateSpec(index, "icon", e.target.value)
                      }
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      className="input-text"
                      value={spec.title}
                      onChange={(e) =>
                        updateSpec(index, "title", e.target.value)
                      }
                      placeholder="2+1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtitle</label>
                    <input
                      type="text"
                      className="input-text"
                      value={spec.subtitle}
                      onChange={(e) =>
                        updateSpec(index, "subtitle", e.target.value)
                      }
                      placeholder="Kamar Tidur"
                    />
                  </div>

                  <button
                    className="btn-icon"
                    onClick={() => removeSpec(index)}
                    title="Hapus"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {specs.length < 4 && (
              <button
                className="btn-secondary"
                onClick={addSpec}
                style={{ width: "100%" }}
              >
                + Tambah Spesifikasi
              </button>
            )}
          </div>

          <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
              Animasi
            </h3>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Mode Animasi</label>
              <select
                className="select"
                value={animationMode}
                onChange={(e) => setAnimationMode(e.target.value)}
              >
                <option value="bersamaan">Bersamaan</option>
                <option value="berurutan">Berurutan</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Jenis Animasi</label>
              <select
                className="select"
                value={animationType}
                onChange={(e) => setAnimationType(e.target.value)}
              >
                <option value="fade">Fade In/Out</option>
                <option value="slideUp">Slide Up</option>
                <option value="slideDown">Slide Down</option>
                <option value="slideLeft">Slide Left</option>
                <option value="slideRight">Slide Right</option>
                <option value="scale">Scale Up</option>
                <option value="bounce">Bounce</option>
                <option value="rotate">Rotate</option>
              </select>
            </div>

            <div className="animation-controls">
              <div className="form-group">
                <label>Fade In (s)</label>
                <input
                  type="number"
                  className="input-number"
                  value={animationSettings.fadeIn}
                  onChange={(e) =>
                    setAnimationSettings({
                      ...animationSettings,
                      fadeIn: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Display (s)</label>
                <input
                  type="number"
                  className="input-number"
                  value={animationSettings.display}
                  onChange={(e) =>
                    setAnimationSettings({
                      ...animationSettings,
                      display: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Fade Out (s)</label>
                <input
                  type="number"
                  className="input-number"
                  value={animationSettings.fadeOut}
                  onChange={(e) =>
                    setAnimationSettings({
                      ...animationSettings,
                      fadeOut: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Jarak Antar Spesifikasi (px)</label>
              <input
                type="number"
                className="input-number"
                value={spacing}
                onChange={(e) => setSpacing(parseInt(e.target.value) || 0)}
                min="0"
                max="200"
                step="5"
              />
            </div>
          </div>

          <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
              Background
            </h3>

            <div className="form-group">
              <label>Tipe Background</label>
              <select
                className="select"
                value={backgroundType}
                onChange={(e) => {
                  setBackgroundType(e.target.value);
                  if (e.target.value === "color") {
                    setBackgroundVideoUrl(null);
                  }
                }}
              >
                <option value="color">Solid Color</option>
                <option value="video">Video</option>
              </select>
            </div>

            {backgroundType === "color" && (
              <div className="form-group">
                <label>Warna Background</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    className="color-picker"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {backgroundType === "video" && (
              <div className="form-group">
                <label>Upload Video Background</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                  <label htmlFor="video-upload" className="file-input-label">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {backgroundVideo ? backgroundVideo.name : "Pilih video..."}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="preview-section">
          <div className="card">
            <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
              Preview
            </h3>
            <div className="preview-container">
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
                }}
                durationInFrames={durationInFrames}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                controls
                loop
              />
            </div>

            <div className="export-controls">
              <button
                className="btn-primary"
                onClick={exportVideo}
                disabled={isExporting}
                style={{ flex: 1 }}
                data-testid="export-video-btn"
              >
                {isExporting ? "Exporting..." : "Export Video"}
              </button>
            </div>

            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "#f7fafc",
                borderRadius: "8px",
              }}
            >
              <p style={{ fontSize: "0.875rem", color: "#4a5568", margin: 0 }}>
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
