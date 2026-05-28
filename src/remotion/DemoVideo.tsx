import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ChatScene } from "./scenes/ChatScene";
import { KBScene } from "./scenes/KBScene";
import { BookingScene } from "./scenes/BookingScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { SceneWrapper } from "./components/SceneWrapper";
import { ProgressIndicator } from "./components/ProgressIndicator";

// 50 seconds total (1500 frames at 30fps)
const SCENES = {
  title:     { from: 0,    duration: 240 },   // 8s
  chat:      { from: 220,  duration: 270 },   // 9s
  kb:        { from: 470,  duration: 240 },   // 8s
  booking:   { from: 690,  duration: 240 },   // 8s
  dashboard: { from: 910,  duration: 270 },   // 9s
  closing:   { from: 1160, duration: 340 },   // 11s
};

const TOTAL_FRAMES = 1500;

// Determine current scene for progress indicator
const getCurrentScene = (frame: number): number => {
  if (frame < SCENES.chat.from) return 0;
  if (frame < SCENES.kb.from) return 1;
  if (frame < SCENES.booking.from) return 2;
  if (frame < SCENES.dashboard.from) return 3;
  if (frame < SCENES.closing.from) return 4;
  return 5;
};

// Animated background
const BackgroundGradient: React.FC = () => {
  const frame = useCurrentFrame();

  const gradientAngle = interpolate(frame, [0, TOTAL_FRAMES], [135, 225], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, #FAF7F2 0%, #F0F4F0 50%, #FAF7F2 100%)`,
      }}
    />
  );
};

export const DemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const currentScene = getCurrentScene(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF7F2" }}>
      {/* Animated background */}
      <BackgroundGradient />

      {/* Scene transitions with fade effects */}
      <Sequence from={SCENES.title.from} durationInFrames={SCENES.title.duration}>
        <SceneWrapper durationInFrames={SCENES.title.duration}>
          <TitleScene />
        </SceneWrapper>
      </Sequence>

      <Sequence from={SCENES.chat.from} durationInFrames={SCENES.chat.duration}>
        <SceneWrapper durationInFrames={SCENES.chat.duration}>
          <ChatScene />
        </SceneWrapper>
      </Sequence>

      <Sequence from={SCENES.kb.from} durationInFrames={SCENES.kb.duration}>
        <SceneWrapper durationInFrames={SCENES.kb.duration}>
          <KBScene />
        </SceneWrapper>
      </Sequence>

      <Sequence from={SCENES.booking.from} durationInFrames={SCENES.booking.duration}>
        <SceneWrapper durationInFrames={SCENES.booking.duration}>
          <BookingScene />
        </SceneWrapper>
      </Sequence>

      <Sequence from={SCENES.dashboard.from} durationInFrames={SCENES.dashboard.duration}>
        <SceneWrapper durationInFrames={SCENES.dashboard.duration}>
          <DashboardScene />
        </SceneWrapper>
      </Sequence>

      <Sequence from={SCENES.closing.from} durationInFrames={SCENES.closing.duration}>
        <SceneWrapper durationInFrames={SCENES.closing.duration}>
          <ClosingScene />
        </SceneWrapper>
      </Sequence>

      {/* Progress indicator */}
      <ProgressIndicator totalScenes={6} currentScene={currentScene} />
    </AbsoluteFill>
  );
};
