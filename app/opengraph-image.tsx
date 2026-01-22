import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "MikroORM Visualizer - Entity Relationship Diagram Editor"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        {/* Logo and Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Logo Icon (simplified) */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <path d="M10 6.5h4" />
              <path d="M6.5 10v4" />
              <path d="M17.5 10v4" />
              <path d="M10 17.5h4" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              MikroORM Visualizer
            </span>
            <span
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                fontWeight: 400,
              }}
            >
              Entity Relationship Diagram Editor
            </span>
          </div>
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          {["Visual Editor", "TypeScript Export", "Code Generation"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  color: "#60a5fa",
                  fontSize: "18px",
                  fontWeight: 500,
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "60px",
            width: "120px",
            height: "80px",
            borderRadius: "8px",
            border: "2px solid #3b82f6",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "180px",
            left: "120px",
            width: "100px",
            height: "60px",
            borderRadius: "8px",
            border: "2px solid #8b5cf6",
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "80px",
            width: "140px",
            height: "90px",
            borderRadius: "8px",
            border: "2px solid #3b82f6",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "160px",
            right: "160px",
            width: "80px",
            height: "50px",
            borderRadius: "8px",
            border: "2px solid #8b5cf6",
            opacity: 0.2,
          }}
        />

        {/* Connection Lines */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <line
            x1="180"
            y1="100"
            x2="280"
            y2="180"
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.2"
          />
          <line
            x1="1020"
            y1="530"
            x2="920"
            y2="470"
            stroke="#8b5cf6"
            strokeWidth="2"
            opacity="0.2"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
