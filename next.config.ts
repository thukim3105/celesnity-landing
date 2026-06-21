import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow the dev server to be reached from other devices on the LAN (e.g. a
     phone on the same Wi-Fi at http://192.168.0.130:3000). Next 16 blocks
     cross-origin dev assets/HMR by default; list the LAN IP and its subnet so
     requests from those origins are permitted. Update if your LAN IP changes. */
  allowedDevOrigins: ["192.168.0.130", "192.168.0.*"],
};

export default nextConfig;
