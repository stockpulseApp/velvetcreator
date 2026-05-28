import { ImageResponse } from "next/og";

export const alt = "VelvetCreator — fetish-native creator platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #060608 0%, #1a0f14 45%, #0d0d12 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#c9a87c",
            marginBottom: 24,
          }}
        >
          VelvetCreator
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#f5ebe0",
            lineHeight: 1.1,
            maxWidth: 900,
            fontFamily: "serif",
          }}
        >
          Where creators own their audience
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 26,
            color: "#a89b8f",
            maxWidth: 800,
          }}
        >
          Subscriptions · live · shop · escrow requests — one studio, transparent
          fees
        </div>
      </div>
    ),
    { ...size }
  );
}
