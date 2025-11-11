import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  spring,
} from "remotion";

const BumperOutVideo = ({
  profileImageUrl,
  topText = "More info & Private Viewing",
  nameText = "Reina Tan",
  phoneNumber = "0895 0904 6152",
  showWhatsAppIcon = true,
  backgroundColor = "#2D2D2D",
  cardBackgroundColor = "#FFFFFF",
  cardWidth = 800,
  cardBorderRadius = 20,
  cardPadding = 24,
  cardGap = 20,
  profileImageSize = 80,
  profileImageBorderRadius = 50,
  topTextSize = 14,
  topTextColor = "#000000",
  nameTextSize = 24,
  nameTextColor = "#000000",
  phoneTextSize = 14,
  phoneTextColor = "#000000",
  phoneIconSize = 16,
  phoneIconColor = "#25D366",
  animationType = "fade",
  animationSettings = { fadeIn: 1, display: 3, fadeOut: 1 },
  fontFamily = "Arial",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const { fadeIn = 1, display = 3, fadeOut = 1 } = animationSettings || {};

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

  // Apply animation type
  let opacity = progress;
  let scale = 1;
  let translateY = 0;
  let translateX = 0;

  switch (animationType) {
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
      const bounceProgress = spring({
        frame: frame,
        fps,
        config: {
          damping: 10,
          mass: 0.5,
          stiffness: 100,
        },
      });
      opacity = progress;
      scale = progress * bounceProgress;
      break;
    default:
      opacity = progress;
  }

  // Dimensions
  const canvasWidth = 1080;
  const canvasHeight = 1080;

  // Card dimensions and position (centered)
  const cardHeight = 120;
  const cardX = (canvasWidth - cardWidth) / 2;
  const cardY = (canvasHeight - cardHeight) / 2;

  // Profile image position (left side of card)
  const profileX = cardX + cardPadding;
  const profileY = cardY + cardHeight / 2;

  // Text container position (right side of card)
  const textContainerX = profileX + profileImageSize + cardGap;
  const textContainerY = cardY + cardPadding;
  const textContainerWidth = cardWidth - cardPadding * 2 - profileImageSize - cardGap;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Animated container */}
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px) translateX(${translateX}px)`,
        }}
      >
        {/* Card */}
        <div
          style={{
            position: "absolute",
            left: `${cardX}px`,
            top: `${cardY}px`,
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            backgroundColor: cardBackgroundColor,
            borderRadius: `${cardBorderRadius}px`,
            padding: `${cardPadding}px`,
            display: "flex",
            alignItems: "center",
            gap: `${cardGap}px`,
          }}
        >
          {/* Profile Image */}
          {profileImageUrl && (
            <div
              style={{
                width: `${profileImageSize}px`,
                height: `${profileImageSize}px`,
                borderRadius: `${profileImageBorderRadius}%`,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Img
                src={profileImageUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* Text Container */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            {/* Top Text */}
            <div
              style={{
                fontSize: `${topTextSize}px`,
                color: topTextColor,
                fontFamily: `${fontFamily}, sans-serif`,
                lineHeight: 1.2,
              }}
            >
              {topText}
            </div>

            {/* Name Text */}
            <div
              style={{
                fontSize: `${nameTextSize}px`,
                fontWeight: "bold",
                color: nameTextColor,
                fontFamily: `${fontFamily}, sans-serif`,
                lineHeight: 1.2,
              }}
            >
              {nameText}
            </div>

            {/* Phone Number with Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: `${phoneTextSize}px`,
                color: phoneTextColor,
                fontFamily: `${fontFamily}, sans-serif`,
                lineHeight: 1.2,
              }}
            >
              {showWhatsAppIcon && (
                <svg
                  width={phoneIconSize}
                  height={phoneIconSize}
                  viewBox="0 0 24 24"
                  fill={phoneIconColor}
                  style={{ flexShrink: 0 }}
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              )}
              <span>{phoneNumber}</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default BumperOutVideo;

