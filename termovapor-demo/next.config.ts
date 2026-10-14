import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
  devIndicators: false,
  // Pasta de build configurável, para verificações sem interferir com o servidor em uso.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: path.join(__dirname),
};

export default config;
