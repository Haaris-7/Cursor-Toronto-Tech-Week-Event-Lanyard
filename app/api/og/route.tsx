import { ImageResponse } from "next/og";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) return await response.arrayBuffer();
  }
  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("n") || "Attendee";
    const track = searchParams.get("r") || "";
    const tagline = searchParams.get("g") || "";

    const width = 1200;
    const height = 630;

    const allText = `CURSOR TORONTO TECH WEEK May 27 2026 ${name} ${track} ${tagline} Design your hackathon lanyard`;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#131315",
            fontFamily: "JetBrains Mono, monospace",
            padding: "60px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                color: "#8a8a92",
                fontSize: "24px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              CURSOR × TORONTO TECH WEEK
            </span>
            <span
              style={{
                color: "#5a5a62",
                fontSize: "20px",
                textTransform: "uppercase",
              }}
            >
              May 27, 2026
            </span>
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
                color: "#ededf0",
                fontSize: "64px",
                fontWeight: 600,
                lineHeight: "1.1",
                textTransform: "uppercase",
              }}
            >
              {name}
            </span>
            {track && (
              <span
                style={{
                  color: "#8a8a92",
                  fontSize: "28px",
                  textTransform: "uppercase",
                }}
              >
                {track}
              </span>
            )}
            {tagline && (
              <span
                style={{
                  color: "#ededf0",
                  fontSize: "24px",
                }}
              >
                {tagline}
              </span>
            )}
          </div>

          <div style={{ display: "flex" }}>
            <span
              style={{
                color: "#2a2a2f",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Design your hackathon lanyard
            </span>
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: [
          {
            name: "JetBrains Mono",
            data: await loadGoogleFont("JetBrains+Mono", allText),
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    return new Response("Failed to generate the image", { status: 500 });
  }
}
