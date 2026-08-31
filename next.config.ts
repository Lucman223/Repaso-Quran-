import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  publicExcludes: ['!Coran/**/*'],
});

const nextConfig: NextConfig = {
  // firebase-admin no debe empaquetarse con webpack (usa require dinámicos)
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.quran.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
