import React from 'react'
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Audio,
  staticFile,
} from 'remotion'

// Remotion Presentation Video Settings (3 Minutes = 180 Seconds // Voiceover durations in frames (@ 30 fps)
// c1: 15.88s -> 477 frames
// c2: 16.43s -> 493 frames
// c3: 20.43s -> 613 frames
// c4: 15.31s -> 459 frames
// c5: 12.96s -> 389 frames
// c6: 9.98s -> 300 frames
export const SLIDE_DURATIONS = [477, 493, 613, 459, 389, 300]
export const PRESENTATION_DURATION_FRAMES = SLIDE_DURATIONS.reduce((a, b) => a + b, 0) // 2731 frames (~91.03 seconds)
export const PRESENTATION_FPS = 30
export const PRESENTATION_WIDTH = 1920
export const PRESENTATION_HEIGHT = 1080

// Celalyze Theme Tokens
const COLORS = {
  primary: '#FCFF51', // Vibrant Celo Yellow
  secondary: '#FCF6F1', // Warm Soft Cream
  card: '#FFFFFF',
  dark: '#1E1E1E',
}

interface SlideProps {
  imageSrc: string
  title: string
  subtitle: string
  badgeText: string
  narrationCaption: string
}

const PresentationSlide: React.FC<SlideProps> = ({
  imageSrc,
  title,
  subtitle,
  badgeText,
  narrationCaption,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spring animation for smooth entry
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  })

  // Subtle zoom/pan effect for screenshot preview
  const scale = interpolate(frame, [0, 900], [1, 1.06], {
    extrapolateRight: 'clamp',
  })

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.secondary,
        fontFamily: "'Inter', sans-serif",
        color: COLORS.dark,
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity,
      }}
    >
      {/* Top Bar Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transform: `translateY(${(1 - entrance) * -30}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              backgroundColor: COLORS.primary,
              border: `2px solid ${COLORS.dark}`,
              borderRadius: '9999px',
              padding: '8px 20px',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {badgeText}
          </div>
          <span
            style={{
              fontFamily: "'GT Alpina', Georgia, serif",
              fontSize: '28px',
              fontWeight: 400,
            }}
          >
            Celalyze Presentation
          </span>
        </div>

        <div
          style={{
            backgroundColor: COLORS.card,
            border: `2px solid ${COLORS.dark}`,
            padding: '8px 24px',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Celo Mainnet Agent
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        style={{
          flex: 1,
          margin: '30px 0',
          backgroundColor: COLORS.card,
          border: `3px solid ${COLORS.dark}`,
          boxShadow: '12px 12px 0px rgba(30, 30, 30, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${interpolate(entrance, [0, 1], [0.95, 1])})`,
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${scale})`,
          }}
        />
      </div>

      {/* Bottom Info Overlay / Narration Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '30px',
          backgroundColor: COLORS.card,
          border: `2px solid ${COLORS.dark}`,
          padding: '24px 32px',
          transform: `translateY(${(1 - entrance) * 30}px)`,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'GT Alpina', Georgia, serif",
              fontSize: '32px',
              margin: '0 0 6px 0',
              fontWeight: 400,
            }}
          >
            {title}
          </h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>{subtitle}</p>
        </div>

        {/* Narration Caption Box */}
        <div
          style={{
            backgroundColor: COLORS.secondary,
            border: `2px solid ${COLORS.dark}`,
            padding: '16px 20px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: COLORS.primary,
              border: `1.5px solid ${COLORS.dark}`,
              flexShrink: 0,
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 500,
              fontStyle: 'italic',
              color: COLORS.dark,
              lineHeight: 1.4,
            }}
          >
            "{narrationCaption}"
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// Outro Card Component
const OutroSlide: React.FC = () => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.secondary,
        fontFamily: "'Inter', sans-serif",
        color: COLORS.dark,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px',
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `4px solid ${COLORS.dark}`,
          padding: '60px 80px',
          boxShadow: '16px 16px 0px #1E1E1E',
          maxWidth: '1000px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: COLORS.primary,
            border: `2px solid ${COLORS.dark}`,
            borderRadius: '9999px',
            padding: '10px 28px',
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '30px',
          }}
        >
          CELO HACKATHON MVP
        </div>

        <h1
          style={{
            fontFamily: "'GT Alpina', Georgia, serif",
            fontSize: '64px',
            margin: '0 0 20px 0',
            fontWeight: 400,
          }}
        >
          Try Celalyze Live Today
        </h1>

        <p style={{ fontSize: '24px', opacity: 0.8, marginBottom: '40px', lineHeight: 1.6 }}>
          Automated PnL calculation, tax classification, and natural language portfolio insights for Celo Mainnet.
        </p>

        <div
          style={{
            backgroundColor: COLORS.primary,
            border: `2px solid ${COLORS.dark}`,
            borderRadius: '9999px',
            padding: '16px 40px',
            fontSize: '22px',
            fontWeight: 700,
            display: 'inline-block',
          }}
        >
          celalyze.vercel.app
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const CelalyzePresentationVideo: React.FC = () => {
  // Compute start frames dynamically based on exact voiceover audio durations
  const f0 = 0
  const f1 = f0 + SLIDE_DURATIONS[0]
  const f2 = f1 + SLIDE_DURATIONS[1]
  const f3 = f2 + SLIDE_DURATIONS[2]
  const f4 = f3 + SLIDE_DURATIONS[3]
  const f5 = f4 + SLIDE_DURATIONS[4]

  return (
    <AbsoluteFill>
      {/* Backsound Audio Track (Volume 15%) */}
      <Audio src={staticFile('video-assets/backsound.mp3')} volume={0.15} loop />

      {/* Slide 1: Landing / Hero */}
      <Sequence from={f0} durationInFrames={SLIDE_DURATIONS[0]}>
        <Audio src={staticFile('video-assets/c1.mp3')} />
        <PresentationSlide
          imageSrc="video-assets/slide1_landing.png"
          badgeText="01 / OVERVIEW"
          title="Onchain Tax & Portfolio Agent"
          subtitle="Read-only AI agent tailored for Celo Mainnet ecosystem."
          narrationCaption="Welcome to Celalyze, the first onchain tax and portfolio AI agent built specifically for the Celo Mainnet ecosystem. Connect any wallet address and let the agent index your entire history without exposing private keys."
        />
      </Sequence>

      {/* Slide 2: Dashboard Overview */}
      <Sequence from={f1} durationInFrames={SLIDE_DURATIONS[1]}>
        <Audio src={staticFile('video-assets/c2.mp3')} />
        <PresentationSlide
          imageSrc="video-assets/slide2_dashboard.png"
          badgeText="02 / DASHBOARD"
          title="Portfolio & Tax Metrics"
          subtitle="Real-time balances, realized PnL, and taxable income highlights."
          narrationCaption="Our Portfolio & Tax Dashboard displays your total balance, realized profit and loss, unrealized gains, and taxable income in real-time. Token prices are fetched directly from DeFiLlama and Blockscout APIs."
        />
      </Sequence>

      {/* Slide 3: Tax Reports */}
      <Sequence from={f2} durationInFrames={SLIDE_DURATIONS[2]}>
        <Audio src={staticFile('video-assets/c3.mp3')} />
        <PresentationSlide
          imageSrc="video-assets/slide3_tax_reports.png"
          badgeText="03 / TAX ENGINE"
          title="IRS Form 8949 & FIFO Calculations"
          subtitle="Configurable accounting frameworks (FIFO, LIFO, HIFO) with CSV export."
          narrationCaption="In the Tax Reports module, Celalyze categorizes every transaction into short-term capital gains, ordinary income, or deductible gas expenses using FIFO accounting standards. You can export complete IRS Form 8949 CSV reports."
        />
      </Sequence>

      {/* Slide 4: Transaction History & AI Labels */}
      <Sequence from={f3} durationInFrames={SLIDE_DURATIONS[3]}>
        <Audio src={staticFile('video-assets/c4.mp3')} />
        <PresentationSlide
          imageSrc="video-assets/slide4_history.png"
          badgeText="04 / CLASSIFICATION"
          title="Transaction History & AI Confidence"
          subtitle="Automatic categorization with confidence scoring and manual corrections."
          narrationCaption="Every indexed transaction receives an AI confidence score and clear category label—from DEX swaps to yield claims. Users can also manually correct labels to refine model accuracy over time."
        />
      </Sequence>

      {/* Slide 5: Interactive AI Chat Agent */}
      <Sequence from={f4} durationInFrames={SLIDE_DURATIONS[4]}>
        <Audio src={staticFile('video-assets/c5.mp3')} />
        <PresentationSlide
          imageSrc="video-assets/slide5_ai_chat.png"
          badgeText="05 / AI CHAT"
          title="Interactive RAG AI Agent"
          subtitle="Natural language Q&A grounded on real Celo transaction data."
          narrationCaption="With our Interactive AI Chat Agent, you can ask complex financial questions in plain English—such as checking your net capital gains or deductible gas expenses—with instant grounding on your Celo wallet data."
        />
      </Sequence>

      {/* Slide 6: Outro */}
      <Sequence from={f5} durationInFrames={SLIDE_DURATIONS[5]}>
        <Audio src={staticFile('video-assets/c6.mp3')} />
        <OutroSlide />
      </Sequence>
    </AbsoluteFill>
  )
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CelalyzePresentation"
        component={CelalyzePresentationVideo}
        durationInFrames={PRESENTATION_DURATION_FRAMES}
        fps={PRESENTATION_FPS}
        width={PRESENTATION_WIDTH}
        height={PRESENTATION_HEIGHT}
      />
    </>
  )
}
