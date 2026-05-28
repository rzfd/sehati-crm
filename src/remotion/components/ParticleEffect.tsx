import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
};

type ParticleEffectProps = {
  count?: number;
  color?: string;
  direction?: "up" | "down";
};

const generateParticles = (count: number): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: (i * 137.508) % 100, // Golden angle distribution
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.2 + Math.random() * 0.4,
      delay: Math.random() * 60,
    });
  }
  return particles;
};

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  count = 20,
  color = "rgba(255,255,255,0.3)",
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() => generateParticles(count), [count]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles.map((particle, i) => {
        const adjustedFrame = Math.max(0, frame - particle.delay);
        const yOffset = adjustedFrame * particle.speed;
        const y = direction === "up" ? 100 - (particle.y + yOffset) % 120 : particle.y + yOffset % 120;

        const particleOpacity = interpolate(
          adjustedFrame,
          [0, 30],
          [0, particle.opacity],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${particle.x}%`,
              top: `${y}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: particleOpacity,
            }}
          />
        );
      })}
    </div>
  );
};
