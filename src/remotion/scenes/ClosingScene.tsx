import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  IconHospital,
  IconBot,
  IconBook,
  IconCalendar,
  IconBarChart,
} from "../components/Icons";
import { ParticleEffect } from "../components/ParticleEffect";

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1 },
  });

  const featuresOpacity = interpolate(frame, [40, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [100, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgGradient = interpolate(frame, [0, 340], [135, 180], {
    extrapolateRight: "clamp",
  });

  const features = [
    { Icon: IconBot, label: "Chat AI 24/7" },
    { Icon: IconBook, label: "Basis Pengetahuan" },
    { Icon: IconCalendar, label: "Janji Temu Pintar" },
    { Icon: IconBarChart, label: "Analitik Klinik" },
  ];

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
      <ParticleEffect count={25} color="rgba(255,255,255,0.12)" direction="up" />

      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.06)",
          top: -300,
          left: -200,
          transform: `rotate(${frame * 0.4}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.04)",
          bottom: -100,
          right: -100,
          transform: `rotate(${-frame * 0.3}deg)`,
        }}
      />

      {/* Logo with glow */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          marginBottom: 30,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: 35,
            background: "radial-gradient(circle, rgba(74,157,110,0.4) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3), 0 0 60px rgba(74,157,110,0.3)",
            position: "relative",
          }}
        >
          <IconHospital size={60} color="#2D5A3D" />
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          color: "white",
          fontSize: 84,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -2,
          textShadow: "0 6px 30px rgba(0,0,0,0.4), 0 0 80px rgba(74,157,110,0.3)",
        }}
      >
        Sehati CRM
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: interpolate(frame, [30, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          color: "rgba(255,255,255,0.9)",
          fontSize: 32,
          fontWeight: 500,
          fontFamily: "system-ui, sans-serif",
          marginTop: 10,
          textShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        Solusi CRM Berbasis AI untuk Klinik
      </div>

      {/* Features with staggered animation */}
      <div
        style={{
          opacity: featuresOpacity,
          display: "flex",
          gap: 50,
          marginTop: 50,
        }}
      >
        {features.map((f, i) => {
          const featureScale = spring({
            frame: Math.max(0, frame - 50 - i * 15),
            fps,
            config: { damping: 15, stiffness: 80 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                transform: `scale(${featureScale})`,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <f.Icon size={32} color="white" />
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {f.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          marginTop: 60,
          color: "white",
          fontSize: 26,
          fontFamily: "system-ui, sans-serif",
          padding: "20px 50px",
          border: "2px solid rgba(255,255,255,0.4)",
          borderRadius: 50,
          fontWeight: 600,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        Tingkatkan Pelayanan Klinik Anda
      </div>

      {/* URL */}
      <div
        style={{
          opacity: ctaOpacity,
          marginTop: 25,
          color: "rgba(255,255,255,0.6)",
          fontSize: 20,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        github.com/rzfd/sehati-crm
      </div>
    </AbsoluteFill>
  );
};
