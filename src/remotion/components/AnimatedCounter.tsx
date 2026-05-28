import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type AnimatedCounterProps = {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  delay?: number;
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 60,
  suffix = "",
  prefix = "",
  fontSize = 48,
  color = "#333",
  fontWeight = 800,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 30, stiffness: 80 },
    durationInFrames: duration,
  });

  const currentValue = Math.round(interpolate(progress, [0, 1], [from, to]));

  const scale = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        transform: `scale(${scale})`,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}{currentValue.toLocaleString()}{suffix}
    </div>
  );
};
