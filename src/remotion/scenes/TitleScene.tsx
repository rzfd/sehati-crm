import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { IconHospital } from "../components/Icons";
import { ParticleEffect } from "../components/ParticleEffect";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1 },
  });

  const subtitleOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [50, 80], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgGradient = interpolate(frame, [0, 240], [135, 180], {
    extrapolateRight: "clamp",
  });

  // Floating circles animation
  const circle1Rotate = frame * 0.3;
  const circle2Rotate = -frame * 0.2;
  const circle1Scale = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [0.95, 1.05]
  );
  const circle2Scale = interpolate(
    Math.cos(frame * 0.015),
    [-1, 1],
    [0.98, 1.02]
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${bgGradient}deg, #1a3a2a 0%, #2D5A3D 30%, #3A7D4E 60%, #4A9D6E 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Particle effects */}
      <ParticleEffect count={30} color="rgba(255,255,255,0.15)" direction="up" />

      {/* Animated decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.08)",
          top: -250,
          right: -250,
          transform: `rotate(${circle1Rotate}deg) scale(${circle1Scale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.06)",
          bottom: -150,
          left: -150,
          transform: `rotate(${circle2Rotate}deg) scale(${circle2Scale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.04)",
          top: "50%",
          left: "10%",
          transform: `rotate(${circle1Rotate * 0.5}deg)`,
        }}
      />

      {/* Logo / Icon with glow */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          marginBottom: 40,
          position: "relative",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: 40,
            background: "radial-gradient(circle, rgba(74,157,110,0.4) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 35,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3), 0 0 60px rgba(74,157,110,0.3)",
            position: "relative",
          }}
        >
          <IconHospital size={70} color="#2D5A3D" />
        </div>
      </div>

      {/* Title with text shadow */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          color: "white",
          fontSize: 108,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -3,
          textShadow: "0 6px 30px rgba(0,0,0,0.4), 0 0 80px rgba(74,157,110,0.3)",
          position: "relative",
        }}
      >
        Sehati CRM
      </div>

      {/* Subtitle with slide up */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          color: "rgba(255,255,255,0.95)",
          fontSize: 40,
          fontWeight: 500,
          fontFamily: "system-ui, sans-serif",
          marginTop: 20,
          textShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        AI-powered CRM untuk Klinik Indonesia
      </div>

      {/* Tagline with fade */}
      <div
        style={{
          opacity: taglineOpacity,
          color: "rgba(255,255,255,0.8)",
          fontSize: 28,
          fontFamily: "system-ui, sans-serif",
          marginTop: 50,
          padding: "16px 40px",
          border: "2px solid rgba(255,255,255,0.3)",
          borderRadius: 50,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        }}
      >
        Satu Hati, Satu Solusi
      </div>
    </AbsoluteFill>
  );
};
