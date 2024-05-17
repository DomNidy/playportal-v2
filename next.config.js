/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
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

export default config;
