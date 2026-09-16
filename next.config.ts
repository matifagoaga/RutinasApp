import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Las rutinas pueden incluir fotos/GIFs por ejercicio como data URLs.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
