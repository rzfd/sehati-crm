import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  IconChat,
  IconBot,
  IconBrain,
  IconSearch,
  IconBook,
  IconCheck,
  IconZap,
} from "../components/Icons";
import { TypingEffect } from "../components/TypingEffect";
import { GlowPulse } from "../components/GlowPulse";

const MESSAGES = [
  { type: "patient", text: "Jam berapa klinik buka hari Sabtu?", delay: 20 },
  { type: "ai-badge", text: "Asisten AI", delay: 70 },
  { type: "ai", text: "Klinik Sehati buka Sabtu jam 08:00-14:00.", delay: 90 },
  { type: "patient", text: "Anak saya demam sudah 3 hari", delay: 150 },
  { type: "escalate", text: "Diteruskan ke Staf Klinik", delay: 210 },
  { type: "staff", text: "Baik, saya bantu hubungkan ke dr. Anak.", delay: 250 },
];

const PIPELINE_STEPS = [
  { label: "Deteksi Kata Darurat", desc: "Kenali pesan emergency", status: "pass", delay: 20, Icon: IconCheck },
  { label: "Pahami Niat Pasien", desc: "FAQ, booking, atau keluhan", status: "faq", delay: 60, Icon: IconSearch },
  { label: "Cari Jawaban Otomatis", desc: "Temukan dari basis pengetahuan", status: "match", delay: 100, Icon: IconBook },
  { label: "Balas atau Teruskan", desc: "Jawab jika yakin, serahkan ke staf jika ragu", status: "reply", delay: 140, Icon: IconChat },
];

export const ChatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#FAF7F2",
        display: "flex",
        flexDirection: "row",
        padding: 60,
        gap: 40,
      }}
    >
      {/* Left: Chat UI */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          opacity: headerOpacity,
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            backgroundColor: "#2D5A3D",
            color: "white",
            padding: "20px 28px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <GlowPulse color="rgba(255,255,255,0.3)" size={10}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconChat size={24} color="white" />
            </div>
          </GlowPulse>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Klinik Sehati</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Asisten AI aktif 24/7
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderRadius: "0 0 16px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          {MESSAGES.map((msg, i) => {
            const msgOpacity = interpolate(
              frame,
              [msg.delay, msg.delay + 25],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const msgY = interpolate(
              frame,
              [msg.delay, msg.delay + 25],
              [20, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            if (msg.type === "ai-badge") {
              return (
                <div
                  key={i}
                  style={{
                    opacity: msgOpacity,
                    transform: `translateY(${msgY}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#E8F5E9",
                      color: "#2D5A3D",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <IconBot size={14} color="#2D5A3D" />
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.type === "escalate") {
              return (
                <div
                  key={i}
                  style={{
                    opacity: msgOpacity,
                    transform: `translateY(${msgY}px)`,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#FFF3E0",
                      color: "#E65100",
                      fontSize: 14,
                      fontWeight: 600,
                      padding: "8px 20px",
                      borderRadius: 20,
                      border: "1px solid #FFB74D",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <IconZap size={16} color="#E65100" />
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isPatient = msg.type === "patient";
            const isTyping = frame >= msg.delay && frame < msg.delay + msg.text.length * 2 + 20;

            return (
              <div
                key={i}
                style={{
                  opacity: msgOpacity,
                  transform: `translateY(${msgY}px)`,
                  display: "flex",
                  justifyContent: isPatient ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    backgroundColor: isPatient ? "#2D5A3D" : "#F5F5F5",
                    color: isPatient ? "white" : "#333",
                    padding: "14px 20px",
                    borderRadius: isPatient
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    maxWidth: "75%",
                    fontSize: 18,
                    lineHeight: 1.5,
                  }}
                >
                  {isPatient || msg.type === "staff" ? (
                    <TypingEffect
                      text={msg.text}
                      speed={2}
                      delay={msg.delay}
                      fontSize={18}
                      color={isPatient ? "white" : "#333"}
                      showCursor={isTyping}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Pipeline Visualization */}
      <div
        style={{
          width: 500,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#2D5A3D",
            marginBottom: 16,
            opacity: interpolate(frame, [10, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <IconBrain size={28} color="#2D5A3D" />
          Cara Kerja Asisten AI
        </div>

        {PIPELINE_STEPS.map((step, i) => {
          const stepOpacity = interpolate(
            frame,
            [step.delay, step.delay + 25],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const stepScale = spring({
            frame: Math.max(0, frame - step.delay),
            fps,
            config: { damping: 15, stiffness: 100 },
          });

          const StepIcon = step.Icon;
          const isActive = frame >= step.delay && frame < step.delay + 50;

          return (
            <div
              key={i}
              style={{
                opacity: stepOpacity,
                transform: `scale(${stepScale})`,
                backgroundColor: "white",
                padding: "18px 24px",
                borderRadius: 12,
                boxShadow: isActive
                  ? "0 8px 24px rgba(0,0,0,0.12)"
                  : "0 4px 16px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                borderLeft: `4px solid ${
                  step.status === "pass"
                    ? "#4CAF50"
                    : step.status === "faq"
                    ? "#2196F3"
                    : step.status === "match"
                    ? "#9C27B0"
                    : "#FF9800"
                }`,
                transition: "box-shadow 0.3s ease",
              }}
            >
              <GlowPulse
                color={
                  step.status === "pass"
                    ? "rgba(76,175,80,0.4)"
                    : step.status === "faq"
                    ? "rgba(33,150,243,0.4)"
                    : step.status === "match"
                    ? "rgba(156,39,176,0.4)"
                    : "rgba(255,152,0,0.4)"
                }
                size={8}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor:
                      step.status === "pass"
                        ? "#E8F5E9"
                        : step.status === "faq"
                        ? "#E3F2FD"
                        : step.status === "match"
                        ? "#F3E5F5"
                        : "#FFF3E0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StepIcon
                    size={20}
                    color={
                      step.status === "pass"
                        ? "#4CAF50"
                        : step.status === "faq"
                        ? "#2196F3"
                        : step.status === "match"
                        ? "#9C27B0"
                        : "#FF9800"
                    }
                  />
                </div>
              </GlowPulse>
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#333",
                  }}
                >
                  {step.label}
                </div>
                <div style={{ fontSize: 14, color: "#888" }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}

        {/* Key benefit */}
        <div
          style={{
            opacity: interpolate(frame, [180, 210], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            backgroundColor: "#E8F5E9",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          <IconCheck size={20} color="#4CAF50" />
          <div style={{ fontSize: 15, color: "#2D5A3D", fontWeight: 600 }}>
            Pasien dapat jawaban instan, staf fokus pada kasus penting
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
