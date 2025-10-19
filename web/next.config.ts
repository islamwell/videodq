import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	// Ensure Next.js resolves file tracing relative to the monorepo root on Vercel
	outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
