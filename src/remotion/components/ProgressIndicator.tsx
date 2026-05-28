import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type ProgressIndicatorProps = {
  totalScenes: number;
  currentScene: number;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalScenes,
  currentScene,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 12,
        alignItems: "center",
        zIndex: 100,
      }}
    >
      {Array.from({ length: totalScenes }).map((_, i) => {
        const isActive = i === currentScene;
        const isPast = i < currentScene;

        const dotScale = spring({
          frame: isActive ? frame : 0,
          fps,
          config: { damping: 12, stiffness: 200 },
        });

        return (
          <div
            key={i}
            style={{
              width: isActive ? 32 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isActive
                ? "white"
                : isPast
                ? "rgba(255,255,255,0.6)"
                : "rgba(255,255,255,0.25)",
              transform: `scale(${isActive ? dotScale : 1})`,
              transition: "all 0.3s ease",
              boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
            }}
          />
        );
      })}
    </div>
  );
};
