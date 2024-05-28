/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import createMDX from "fumadocs-mdx/config";
import withPlaiceholder from "@plaiceholder/next";

await import("./src/env.js");


const withMDX = createMDX();

/** @type {import("next").NextConfig} */
const config = {
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
    images:
    {
        remotePatterns: [
            {
                protocol: "https",
                port: '',
                hostname: "playportal.app",
            },
            {
                protocol: "http",
                port: '3000',
                hostname: "localhost",
            }
        ]
    }
};

export default withPlaiceholder(withMDX(config));
