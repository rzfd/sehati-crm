import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  IconCalendar,
  IconUser,
  IconClock,
  IconCheck,
  IconBot,
  IconActivity,
} from "../components/Icons";

const SLOTS = [
  { time: "09:00", available: true, delay: 60 },
  { time: "09:30", available: false, delay: 70 },
  { time: "10:00", available: true, delay: 80 },
  { time: "10:30", available: true, delay: 90 },
  { time: "11:00", available: false, delay: 100 },
  { time: "11:30", available: true, delay: 110 },
];

export const BookingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #FFF8E1 0%, #FAF7F2 100%)",
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
          gap: 20,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: "#FF9800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconCalendar size={32} color="white" />
        </div>
        <div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#333",
            }}
          >
            Pemesanan Janji Temu
          </div>
          <div style={{ fontSize: 20, color: "#666" }}>
            AI pahami kebutuhan pasien dari chat
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, flex: 1 }}>
        {/* Left: Chat extraction */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Chat message */}
          <div
            style={{
              opacity: interpolate(frame, [15, 45], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#888",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Pesan Pasien
            </div>
            <div
              style={{
                backgroundColor: "#2D5A3D",
                color: "white",
                padding: "14px 20px",
                borderRadius: "16px 16px 4px 16px",
                fontSize: 18,
              }}
            >
              &quot;Saya mau booking ke dr. Sarah besok pagi untuk cek
              darah&quot;
            </div>
          </div>

          {/* Extracted Info */}
          <div
            style={{
              opacity: interpolate(frame, [50, 80], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              borderLeft: "4px solid #FF9800",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#FF9800",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <IconBot size={18} color="#FF9800" />
              AI Memahami Kebutuhan Pasien
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Dokter", value: "dr. Sarah (Umum)", Icon: IconUser },
                { label: "Tanggal", value: "Besok (29 Mei 2026)", Icon: IconCalendar },
                { label: "Waktu", value: "Pagi (09:00)", Icon: IconClock },
                { label: "Keperluan", value: "Cek darah", Icon: IconActivity },
              ].map((item, i) => {
                const itemOpacity = interpolate(
                  frame,
                  [60 + i * 12, 75 + i * 12],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return (
                  <div
                    key={i}
                    style={{
                      opacity: itemOpacity,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      backgroundColor: "#FFF8E1",
                      borderRadius: 8,
                    }}
                  >
                    <item.Icon size={20} color="#FF9800" />
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#888",
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          color: "#333",
                          fontWeight: 600,
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Schedule */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Doctor card */}
          <div
            style={{
              opacity: interpolate(frame, [30, 60], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#E8F5E9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconUser size={40} color="#2D5A3D" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#333",
                }}
              >
                dr. Sarah Wijaya
              </div>
              <div style={{ fontSize: 16, color: "#666" }}>
                Dokter Umum
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#4CAF50",
                  fontWeight: 600,
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#4CAF50",
                  }}
                />
                Praktek Hari Ini
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div
            style={{
              opacity: interpolate(frame, [50, 80], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#333",
                marginBottom: 16,
              }}
            >
              Jam Tersedia — 29 Mei 2026
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {SLOTS.map((slot, i) => {
                const slotScale = spring({
                  frame: Math.max(0, frame - slot.delay),
                  fps,
                  config: { damping: 15, stiffness: 100 },
                });
                const isSelected = slot.time === "09:00";

                return (
                  <div
                    key={i}
                    style={{
                      transform: `scale(${slotScale})`,
                      padding: "14px 16px",
                      borderRadius: 10,
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 16,
                      backgroundColor: !slot.available
                        ? "#F5F5F5"
                        : isSelected
                        ? "#2D5A3D"
                        : "#E8F5E9",
                      color: !slot.available
                        ? "#CCC"
                        : isSelected
                        ? "white"
                        : "#2D5A3D",
                      border: isSelected
                        ? "2px solid #2D5A3D"
                        : "2px solid transparent",
                      opacity: slot.available ? 1 : 0.5,
                    }}
                  >
                    {slot.time}
                    {!slot.available && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#CCC",
                          marginTop: 2,
                        }}
                      >
                        Terisi
                      </div>
                    )}
                    {isSelected && (
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.8,
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <IconCheck size={12} color="white" />
                        Dipilih
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm */}
          <div
            style={{
              opacity: interpolate(frame, [130, 160], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "#2D5A3D",
              color: "white",
              borderRadius: 12,
              padding: "16px 24px",
              textAlign: "center",
              fontSize: 18,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(45,90,61,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <IconCheck size={20} color="white" />
            Janji Temu Terkonfirmasi — dr. Sarah, 29 Mei 09:00
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
