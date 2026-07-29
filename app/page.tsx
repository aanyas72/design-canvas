import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#030712",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
      }}
    >
      <style>{`
        .mode-card {
          width: 220px;
          padding: 28px 24px;
          background-color: #0f0f0f;
          border: 1px solid #404040;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.2s, background-color 0.2s;
        }
        .mode-card:hover {
          background-color: #161616;
          border-color: #606060;
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>
          design canvas
        </h1>
        <p style={{ color: "#525252", fontSize: "14px", marginTop: "8px" }}>
          choose a mode
        </p>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <Link href="/canvas" className="mode-card">
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#f5f5f5" }}>Timed Canvas</span>
          <span style={{ fontSize: "12px", color: "#737373", lineHeight: 1.6 }}>
            Free-form design canvas. Enter a prompt to pull assets and compose.
          </span>
        </Link>
        <Link href="/game" className="mode-card">
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#f5f5f5" }}>AI Game Mode</span>
          <span style={{ fontSize: "12px", color: "#737373", lineHeight: 1.6 }}>
            Compete against an AI agent. Same prompt, same assets.
          </span>
        </Link>
      </div>

      <Link
        href="/upload"
        style={{ fontSize: "11px", color: "#404040", textDecoration: "none" }}
      >
        Add Assets →
      </Link>
    </div>
  );
}
