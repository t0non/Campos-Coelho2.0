import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const alt = `${siteConfig.businessName} - Salão de Beleza em Santa Efigênia, BH`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          backgroundColor: "#2B231B",
          color: "#FBEDDF",
          fontFamily: "sans-serif",
          padding: "60px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Fine caramel border */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "30px",
            right: "30px",
            bottom: "30px",
            border: "2px solid #905A24",
            borderRadius: "16px",
            opacity: 0.5,
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: "20px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#905A24",
            fontWeight: "600",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          Salão de Beleza em Santa Efigênia, BH
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {siteConfig.businessName}
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#FBEDDF",
            maxWidth: "800px",
            lineHeight: "1.4",
            display: "flex",
          }}
        >
          {siteConfig.description}
        </div>

        <div
          style={{
            marginTop: "40px",
            fontSize: "18px",
            color: "#905A24",
            letterSpacing: "2px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          R. Padre Rolim, 715 • Condomínio Edifício Angelini Center
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
