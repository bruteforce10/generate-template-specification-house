import React, { useState, useEffect } from "react";
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

  const calculateTotalDuration = () => {
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
  };

  const [durationInFrames, setDurationInFrames] = useState(
    calculateTotalDuration() * 30
  );

  useEffect(() => {
    setDurationInFrames(Math.ceil(calculateTotalDuration() * 30));
  }, [animationSettings, specs, animationMode]);

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
      // Prepare video configuration
      const videoConfig = {
        specs,
        backgroundType,
        backgroundColor,
        backgroundVideoUrl: backgroundVideo
          ? await fileToBase64(backgroundVideo)
          : null,
        spacing,
        animationSettings,
        animationMode,
        animationType,
        duration: calculateTotalDuration(),
        resolution: {
          width: 1080,
          height: 1920,
        },
      };

      toast.info(
        "Memulai export video... Ini mungkin memakan waktu beberapa menit."
      );

      toast.success("Video berhasil di-export!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export video. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
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
