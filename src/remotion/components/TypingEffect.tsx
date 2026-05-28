import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type TypingEffectProps = {
  text: string;
  speed?: number;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  showCursor?: boolean;
};

export const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  speed = 2,
  delay = 0,
  fontSize = 18,
  color = "#333",
  fontWeight = 400,
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - delay);

  const charactersToShow = Math.min(
    Math.floor(adjustedFrame / speed),
    text.length
  );

  const displayText = text.slice(0, charactersToShow);
  const isTyping = charactersToShow < text.length;

  // Cursor blink
  const cursorOpacity = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0, 1]
  );

  return (
    <div
      style={{
        fontSize,
        color,
        fontWeight,
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.5,
      }}
    >
      {displayText}
      {showCursor && isTyping && (
        <span
          style={{
            opacity: cursorOpacity,
            color: "#2D5A3D",
            marginLeft: 2,
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
