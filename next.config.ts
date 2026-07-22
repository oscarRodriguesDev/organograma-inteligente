import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // ─── Client Cache ──────────────────────────────────────────
  // Mantém páginas dinâmicas em cache no navegador por 30s,
  // evitando requisições repetidas ao servidor em navegações
  // frequentes entre páginas já visitadas.
  experimental: {
    staleTimes: {
      dynamic: 30,   // 30s: páginas dinâmicas ficam em cache no cliente
      static: 300,   // 5min: páginas estáticas/prefetched
    },
  },
};

export default nextConfig;
