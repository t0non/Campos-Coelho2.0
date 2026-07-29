import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = siteConfig.services.find((s) => s.slug === slug);
  const serviceName = service ? service.name : "Serviço de Beleza";

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
          {siteConfig.businessName} • Santa Efigênia, BH
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          {serviceName}
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
          {service ? service.shortDescription : siteConfig.description}
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
          Condomínio Edifício Angelini Center • Rua Padre Rolim, 715
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
