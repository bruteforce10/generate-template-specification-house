import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  spring,
} from "remotion";

const CalloutLabelVideo = ({
  imageUrl,
  arrowMirrored = false,
  topText = "Kuningan PIK",
  bottomText = "4 Menit",
  calloutColor = "#FF0000",
  borderColor = "#FF0000",
  borderThickness = 4,
  lineThickness = 8,
  markerSize = 12,
  backgroundColor = "#000000",
  topTextColor = "#FF0000",
  bottomTextColor = "#FFFFFF",
  animationType = "fade",
  animationSettings = { fadeIn: 1, display: 3, fadeOut: 1 },
  fontFamily = "Arial",
  textSpacing = 8,
  diagonalLength = 600,
  horizontalLength = 400,
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

  // Marker position (bottom left or right depending on mirror)
  const markerX = arrowMirrored ? canvasWidth - 60 : 60;
  const markerY = canvasHeight - 60;

  // Line path dengan bentuk siku (L-shape): diagonal naik vertikal lalu belok 90 derajat horizontal
  const lineStartX = markerX;
  const lineStartY = markerY;

  // Bentuk siku sederhana (L-shape):
  // 1. Garis vertikal naik dari marker (X tetap, Y berkurang) sejauh diagonalLength
  // 2. Belok 90 derajat horizontal (Y tetap, X menuju targetX) ke text box

  // Corner adalah titik belok (siku)
  // Corner X = markerX (garis vertikal, X tidak berubah)
  const cornerX = markerX;

  // Corner Y = markerY - diagonalLength (naik vertikal)
  const cornerY = markerY - diagonalLength;

  // End point: garis horizontal dengan panjang yang bisa dikustomisasi
  // End X = cornerX + horizontalLength (atau - jika arrowMirrored)
  const lineEndX = arrowMirrored
    ? cornerX - horizontalLength
    : cornerX + horizontalLength;
  const lineEndY = cornerY;

  // Text box position: menempel di atas garis horizontal
  // Text box diletakkan tepat di atas end point garis horizontal
  const textBoxWidth = 300;
  const textBoxHeight = 120;
  // Text box X = lineEndX (centered pada end point garis horizontal)
  const textBoxX = lineEndX - textBoxWidth / 2;
  // Text box Y = cornerY - textBoxHeight (menempel di atas garis)
  const textBoxY = cornerY - textBoxHeight;

  // Image dimensions (above text box) - menempel dinamis mengikuti text box
  const imageWidth = 400;
  const imageHeight = 250;
  const imageGap = 10; // Gap kecil antara image dan text
  // Image X = centered pada text box (mengikuti end point garis horizontal)
  const imageX = textBoxX + textBoxWidth / 2 - imageWidth / 2;
  // Image Y = di atas text box dengan gap kecil
  const imageY = textBoxY - imageHeight - imageGap;

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Animated container */}
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px) translateX(${translateX}px)`,
        }}
      >
        {/* Image with border (top right) */}
        {imageUrl && (
          <div
            style={{
              position: "absolute",
              left: `${imageX}px`,
              top: `${imageY}px`,
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              border: `${borderThickness}px solid ${borderColor}`,
              overflow: "hidden",
            }}
          >
            <Img
              src={imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Callout line and marker */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Marker (red square at bottom left) */}
          <rect
            x={markerX - markerSize / 2}
            y={markerY - markerSize / 2}
            width={markerSize}
            height={markerSize}
            fill={calloutColor}
          />

          {/* Callout line: vertical from marker to corner, then horizontal to target */}
          <path
            d={`M ${lineStartX} ${lineStartY} L ${cornerX} ${cornerY} L ${lineEndX} ${lineEndY}`}
            stroke={calloutColor}
            strokeWidth={lineThickness}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Text information box */}
        <div
          style={{
            position: "absolute",
            left: `${textBoxX}px`,
            top: `${textBoxY}px`,
            width: `${textBoxWidth}px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Top text */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: topTextColor,
              fontFamily: `${fontFamily}, sans-serif`,
              marginBottom: `${textSpacing}px`,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {topText}
          </div>

          {/* Bottom text with red background bar */}
          <div
            style={{
              width: "100%",
              backgroundColor: calloutColor,
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                fontWeight: "bold",
                color: bottomTextColor,
                fontFamily: `${fontFamily}, sans-serif`,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {bottomText}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default CalloutLabelVideo;
