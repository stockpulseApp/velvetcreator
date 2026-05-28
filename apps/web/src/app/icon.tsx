import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a0a0e 0%, #1a1218 100%)",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 20,
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
