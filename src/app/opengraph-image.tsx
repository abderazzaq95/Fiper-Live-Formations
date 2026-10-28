import { ImageResponse } from "next/og";

export const alt = "Fiper Academy live courses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#031a2d", color: "white", padding: "72px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>Fiper Academy</div>
        <div style={{ display: "flex", height: 18, width: 120, borderRadius: 999, background: "#c32828" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
        <div style={{ fontSize: 76, lineHeight: 1.2, fontWeight: 700 }}>Live market education, made practical.</div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#b7c7d2" }}>Free live courses with confirmation and reminders.</div>
      </div>
    </div>,
    size,
  );
}
