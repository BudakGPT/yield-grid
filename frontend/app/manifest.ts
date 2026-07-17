import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YieldGrid Farmer",
    short_name: "YieldGrid",
    description: "Scan, grade, list, and get paid directly.",
    start_url: "/farmer",
    display: "standalone",
    background_color: "#f3f1e8",
    theme_color: "#0c2419",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
