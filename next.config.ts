import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Next.js 15+ may require this for Playwright
    allowedDevOrigins: ['localhost', '127.0.0.1', '::1'],
  },
  // In case it's top-level
  // allowedDevOrigins: ['localhost', '127.0.0.1', '::1'],
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

export default withNextIntl(withPWAConfig(nextConfig));
