import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type GlowPulseProps = {
  color?: string;
  size?: number;
  children: React.ReactNode;
};

export const GlowPulse: React.FC<GlowPulseProps> = ({
  color = "rgba(74,157,110,0.4)",
  size = 20,
  children,
}) => {
  const frame = useCurrentFrame();

  const pulseScale = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.95, 1.05]
  );

  const pulseOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.6]
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Glow background */}
      <div
        style={{
          position: "absolute",
          inset: -size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: pulseOpacity,
          transform: `scale(${pulseScale})`,
          filter: "blur(15px)",
        }}
      />
      {/* Content */}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};
