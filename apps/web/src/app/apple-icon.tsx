import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0a0e 0%, #2a1a22 100%)",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#e8c4a0",
            fontFamily: "serif",
          }}
        >
          V
        </div>
      </div>
    ),
    { ...size }
  );
}
