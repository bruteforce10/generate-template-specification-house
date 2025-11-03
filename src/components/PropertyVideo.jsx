import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Video,
  spring,
} from "remotion";

const PropertyVideo = ({
  specs,
  backgroundType,
  backgroundColor,
  backgroundVideoUrl,
  getIconComponent,
  spacing = 40,
  animationSettings,
  animationMode = "bersamaan",
  animationType = "fade",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const { fadeIn, display, fadeOut } = animationSettings;

  // Calculate sizing based on number of specs
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

  // Get animation progress for each spec
  const getSpecProgress = (index) => {
    if (animationMode === "bersamaan") {
      // All specs animate together
      const totalDuration = fadeIn + display + fadeOut;

      if (currentTime < fadeIn) {
        return { phase: "in", progress: currentTime / fadeIn };
      } else if (currentTime < fadeIn + display) {
        return { phase: "display", progress: 1 };
      } else if (currentTime < totalDuration) {
        return {
          phase: "out",
          progress: 1 - (currentTime - fadeIn - display) / fadeOut,
        };
      }
      return { phase: "done", progress: 0 };
    } else {
      // Sequential animation: each appears one by one, then all stay, then all fade out together
      const startTime = index * fadeIn;
      const allAppearedTime = specs.length * fadeIn;
      const fadeOutStartTime = allAppearedTime + display;
      const totalDuration = fadeOutStartTime + fadeOut;

      if (currentTime < startTime) {
        // Not started yet
        return { phase: "waiting", progress: 0 };
      } else if (currentTime < startTime + fadeIn) {
        // Fading in
        return { phase: "in", progress: (currentTime - startTime) / fadeIn };
      } else if (currentTime < fadeOutStartTime) {
        // Fully visible (display phase)
        return { phase: "display", progress: 1 };
      } else if (currentTime < totalDuration) {
        // All fade out together
        return {
          phase: "out",
          progress: 1 - (currentTime - fadeOutStartTime) / fadeOut,
        };
      }
      return { phase: "done", progress: 0 };
    }
  };

  // Get animation style based on type
  const getAnimationStyle = (progressData, index) => {
    const baseStyle = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: `${itemGap}px`,
      width: `${itemWidth}px`,
    };

    const { phase, progress } = progressData;

    // Always keep the space in layout, even when waiting or done
    if (phase === "waiting") {
      return { ...baseStyle, opacity: 0, visibility: "hidden" };
    }

    if (phase === "done") {
      return { ...baseStyle, opacity: 0 };
    }

    // For display and out phases, always show at full opacity/position
    const displayProgress = phase === "display" ? 1 : progress;

    switch (animationType) {
      case "fade":
        return {
          ...baseStyle,
          opacity: displayProgress,
        };

      case "slideUp":
        return {
          ...baseStyle,
          opacity: phase === "in" ? progress : displayProgress,
          transform:
            phase === "in"
              ? `translateY(${(1 - progress) * 100}px)`
              : "translateY(0)",
        };

      case "slideDown":
        return {
          ...baseStyle,
          opacity: phase === "in" ? progress : displayProgress,
          transform:
            phase === "in"
              ? `translateY(${(progress - 1) * 100}px)`
              : "translateY(0)",
        };

      case "slideLeft":
        return {
          ...baseStyle,
          opacity: phase === "in" ? progress : displayProgress,
          transform:
            phase === "in"
              ? `translateX(${(progress - 1) * 100}px)`
              : "translateX(0)",
        };

      case "slideRight":
        return {
          ...baseStyle,
          opacity: phase === "in" ? progress : displayProgress,
          transform:
            phase === "in"
              ? `translateX(${(1 - progress) * 100}px)`
              : "translateX(0)",
        };

      case "scale":
        return {
          ...baseStyle,
          opacity: phase === "in" ? progress : displayProgress,
          transform: phase === "in" ? `scale(${progress})` : "scale(1)",
        };

      case "bounce":
        if (phase === "in") {
          const startFrame =
            animationMode === "berurutan" ? index * fadeIn * fps : 0;
          const bounceProgress = spring({
            frame: frame - startFrame,
            fps,
            config: {
              damping: 10,
              mass: 0.5,
              stiffness: 100,
            },
          });
          return {
            ...baseStyle,
            opacity: progress,
            transform: `scale(${progress * bounceProgress})`,
          };
        }
        return {
          ...baseStyle,
          opacity: displayProgress,
          transform: "scale(1)",
        };

      case "rotate":
        return {
          ...baseStyle,
          opacity: phase === "in" ? progress : displayProgress,
          transform:
            phase === "in"
              ? `rotate(${(1 - progress) * 360}deg) scale(${progress})`
              : "rotate(0) scale(1)",
        };

      default:
        return {
          ...baseStyle,
          opacity: displayProgress,
        };
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {backgroundType === "color" && (
        <AbsoluteFill style={{ backgroundColor }} />
      )}

      {backgroundType === "video" && backgroundVideoUrl && (
        <AbsoluteFill>
          <Video
            src={backgroundVideoUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loop
          />
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: `${spacing}px`,
            transform: `scale(${scale})`,
          }}
        >
          {specs.map((spec, index) => {
            const progressData = getSpecProgress(index);
            const animStyle = getAnimationStyle(progressData, index);

            return (
              <div key={index} style={animStyle}>
                <div style={{ color: "white", fontSize: iconSize }}>
                  {React.createElement(getIconComponent(spec.icon), {
                    size: iconSize,
                    strokeWidth: 2,
                  })}
                </div>

                <div
                  style={{
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      fontSize: titleSize,
                      fontWeight: "bold",
                      fontFamily: "Space Grotesk, sans-serif",
                      marginBottom: `${itemGap * 0.3}px`,
                      lineHeight: 1,
                    }}
                  >
                    {spec.title}
                  </div>

                  <div
                    style={{
                      fontSize: subtitleSize,
                      fontFamily: "Inter, sans-serif",
                      opacity: 0.9,
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                      maxWidth: `${itemWidth}px`,
                    }}
                  >
                    {spec.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default PropertyVideo;
