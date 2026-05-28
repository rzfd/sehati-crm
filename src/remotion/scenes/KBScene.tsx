import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { IconBook, IconSearch, IconCheck } from "../components/Icons";

const KB_ITEMS = [
  {
    question: "Jam berapa klinik buka?",
    answer: "Senin-Jumat 08:00-20:00, Sabtu 08:00-14:00",
    similarity: 0.92,
    delay: 30,
  },
  {
    question: "Apakah menerima BPJS?",
    answer: "Ya, kami menerima BPJS Kesehatan",
    similarity: 0.87,
    delay: 70,
  },
  {
    question: "Berapa biaya konsultasi?",
    answer: "Dokter umum: Rp 150.000, Spesialis: Rp 250.000",
    similarity: 0.81,
    delay: 110,
  },
];

export const KBScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #F5F7FA 0%, #E8F5E9 100%)",
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
            backgroundColor: "#2D5A3D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconBook size={32} color="white" />
        </div>
        <div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "#2D5A3D",
            }}
          >
            Basis Pengetahuan Klinik
          </div>
          <div style={{ fontSize: 20, color: "#666" }}>
            Semua informasi klinik, siap dijawab otomatis
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, flex: 1 }}>
        {/* Left: Query */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Search Box */}
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
              marginBottom: 24,
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
              Pertanyaan Pasien
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#333",
                padding: "12px 16px",
                backgroundColor: "#F5F5F5",
                borderRadius: 8,
                border: "2px solid #E0E0E0",
              }}
            >
              &quot;Jam berapa klinik buka hari Sabtu?&quot;
            </div>
          </div>

          {/* How it works */}
          <div
            style={{
              opacity: interpolate(frame, [40, 70], [0, 1], {
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
                fontSize: 16,
                fontWeight: 700,
                color: "#2D5A3D",
                marginBottom: 16,
              }}
            >
              Bagaimana Cara Kerjanya?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { step: "1", text: "Pasien kirim pertanyaan", color: "#2196F3" },
                { step: "2", text: "AI cari jawaban dari basis pengetahuan", color: "#9C27B0" },
                { step: "3", text: "Temukan jawaban yang paling cocok", color: "#4CAF50" },
                { step: "4", text: "Balas otomatis atau teruskan ke staf", color: "#FF9800" },
              ].map((item, i) => {
                const itemOpacity = interpolate(
                  frame,
                  [50 + i * 15, 65 + i * 15],
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
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {item.step}
                    </div>
                    <div style={{ fontSize: 15, color: "#333" }}>
                      {item.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#2D5A3D",
              opacity: interpolate(frame, [25, 55], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <IconSearch size={20} color="#2D5A3D" />
            Jawaban Terbaik yang Ditemukan
          </div>

          {KB_ITEMS.map((item, i) => {
            const itemOpacity = interpolate(
              frame,
              [item.delay, item.delay + 25],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const itemScale = spring({
              frame: Math.max(0, frame - item.delay),
              fps,
              config: { damping: 15, stiffness: 100 },
            });

            const barWidth = interpolate(
              frame,
              [item.delay + 15, item.delay + 45],
              [0, item.similarity * 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `scale(${itemScale})`,
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  borderLeft: `4px solid ${
                    i === 0 ? "#4CAF50" : i === 1 ? "#2196F3" : "#9C27B0"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {item.question}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: i === 0 ? "#4CAF50" : "#666",
                      backgroundColor:
                        i === 0 ? "#E8F5E9" : "#F5F5F5",
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {i === 0 ? "Paling Cocok" : `${(item.similarity * 100).toFixed(0)}% cocok`}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  {item.answer}
                </div>
                {/* Similarity bar */}
                <div
                  style={{
                    height: 6,
                    backgroundColor: "#F0F0F0",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      backgroundColor:
                        i === 0 ? "#4CAF50" : i === 1 ? "#2196F3" : "#9C27B0",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Auto-reply */}
          <div
            style={{
              opacity: interpolate(frame, [140, 170], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              backgroundColor: "#E8F5E9",
              borderRadius: 12,
              padding: 20,
              border: "2px solid #4CAF50",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <IconCheck size={20} color="#4CAF50" style={{ marginTop: 2 }} />
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#2D5A3D",
                  marginBottom: 8,
                }}
              >
                Jawaban Otomatis Terkirim
              </div>
              <div style={{ fontSize: 16, color: "#333" }}>
                &quot;Klinik Sehati buka hari Sabtu jam 08:00-14:00. Ada yang bisa
                dibantu lagi?&quot;
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
