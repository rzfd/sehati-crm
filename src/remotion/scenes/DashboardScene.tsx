import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  IconBarChart,
  IconChat,
  IconBot,
  IconZap,
  IconStar,
  IconBrain,
  IconAlertTriangle,
  IconLightbulb,
  IconTrendingUp,
  IconTrendingDown,
} from "../components/Icons";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { GlowPulse } from "../components/GlowPulse";

const KPI_DATA = [
  { label: "Total Percakapan", value: 1247, change: "+12%", Icon: IconChat, trend: "up" as const, delay: 15 },
  { label: "Ditangani AI", value: 68, change: "+5%", Icon: IconBot, trend: "up" as const, delay: 30, suffix: "%" },
  { label: "Waktu Respons", value: 2.3, change: "-18%", Icon: IconZap, trend: "down" as const, delay: 45, decimals: 1, suffix: " min" },
  { label: "Kepuasan Pasien", value: 4.8, change: "+0.2", Icon: IconStar, trend: "up" as const, delay: 60, decimals: 1, suffix: "/5" },
];

const CHART_DATA = [
  { day: "Sen", value: 45 },
  { day: "Sel", value: 62 },
  { day: "Rab", value: 58 },
  { day: "Kam", value: 71 },
  { day: "Jum", value: 85 },
  { day: "Sab", value: 42 },
  { day: "Min", value: 28 },
];

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#F5F7FA",
        display: "flex",
        flexDirection: "column",
        padding: 60,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <GlowPulse color="rgba(108,99,255,0.4)" size={15}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: "#6C63FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconBarChart size={32} color="white" />
            </div>
          </GlowPulse>
          <div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#333",
              }}
            >
              Dasbor Analitik
            </div>
            <div style={{ fontSize: 20, color: "#666" }}>
              Pantau kinerja klinik secara real-time
            </div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#E8F5E9",
            color: "#2D5A3D",
            padding: "8px 20px",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#4CAF50",
              animation: "pulse 2s infinite",
            }}
          />
          Data Aktif
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {KPI_DATA.map((kpi, i) => {
          const kpiScale = spring({
            frame: Math.max(0, frame - kpi.delay),
            fps,
            config: { damping: 15, stiffness: 100 },
          });

          return (
            <div
              key={i}
              style={{
                flex: 1,
                transform: `scale(${kpiScale})`,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <kpi.Icon size={28} color="#6C63FF" />
                <span
                  style={{
                    fontSize: 14,
                    color: "#888",
                    fontWeight: 600,
                  }}
                >
                  {kpi.label}
                </span>
              </div>
              <AnimatedCounter
                from={0}
                to={kpi.value}
                duration={60}
                delay={kpi.delay + 15}
                fontSize={36}
                fontWeight={800}
                color="#333"
                suffix={kpi.suffix || ""}
              />
              <div
                style={{
                  fontSize: 14,
                  color: kpi.trend === "up" ? "#4CAF50" : "#F44336",
                  fontWeight: 600,
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {kpi.trend === "up" ? (
                  <IconTrendingUp size={14} color="#4CAF50" />
                ) : (
                  <IconTrendingDown size={14} color="#F44336" />
                )}
                {kpi.change} dari minggu lalu
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 20, flex: 1 }}>
        {/* Chart */}
        <div
          style={{
            flex: 2,
            backgroundColor: "white",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#333",
              marginBottom: 24,
              opacity: interpolate(frame, [30, 60], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <IconBarChart size={18} color="#333" />
            Volume Percakapan — Minggu Ini
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 16,
              height: 200,
              paddingBottom: 30,
              position: "relative",
            }}
          >
            {CHART_DATA.map((d, i) => {
              const barHeight = interpolate(
                frame,
                [40 + i * 8, 70 + i * 8],
                [0, (d.value / 100) * 180],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              const isHighest = d.value === Math.max(...CHART_DATA.map(c => c.value));

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isHighest ? "#2D5A3D" : "#666",
                      opacity: interpolate(
                        frame,
                        [50 + i * 8, 75 + i * 8],
                        [0, 1],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        }
                      ),
                    }}
                  >
                    {d.value}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: barHeight,
                      backgroundColor: isHighest ? "#2D5A3D" : "#E0E0E0",
                      borderRadius: "8px 8px 4px 4px",
                      boxShadow: isHighest ? "0 4px 12px rgba(45,90,61,0.3)" : "none",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      color: "#888",
                      fontWeight: 600,
                    }}
                  >
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              opacity: interpolate(frame, [70, 100], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#6C63FF",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <IconBrain size={18} color="#6C63FF" />
              Rekomendasi AI
            </div>
            <div
              style={{
                fontSize: 15,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              Volume naik 23% di hari Jumat. Pertimbangkan tambah staff CS di
              hari tersebut.
            </div>
          </div>

          <div
            style={{
              opacity: interpolate(frame, [100, 130], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "#FFF8E1",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              borderLeft: "4px solid #FF9800",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#E65100",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <IconAlertTriangle size={18} color="#E65100" />
              Perlu Perhatian
            </div>
            <div
              style={{
                fontSize: 15,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              3 janji temu belum dikonfirmasi besok. Pengingat sudah dikirim ke pasien.
            </div>
          </div>

          <div
            style={{
              opacity: interpolate(frame, [130, 160], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "#E8F5E9",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              borderLeft: "4px solid #4CAF50",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#2D5A3D",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <IconLightbulb size={18} color="#2D5A3D" />
              Waktu Hemat
            </div>
            <AnimatedCounter
              from={0}
              to={47}
              duration={60}
              delay={145}
              fontSize={36}
              fontWeight={800}
              color="#2D5A3D"
              suffix=" menit/hari"
            />
            <div
              style={{
                fontSize: 14,
                color: "#666",
                marginTop: 4,
              }}
            >
              estimasi waktu staf dari jawaban AI otomatis
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
