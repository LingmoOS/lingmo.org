import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lingmo OS",
    short_name: "Lingmo OS",
    description: "Elegant, fast, and open-source operating system",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFB",
    theme_color: "#4F7CFF",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
