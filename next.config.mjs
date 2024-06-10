/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import createMDX from "fumadocs-mdx/config";
import withPlaiceholder from "@plaiceholder/next";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"

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
  },

  // https://nextjs.org/docs/app/api-reference/next-config-js/webpack
  // webpack: (config, { isServer,  }) => {
  //   if (!isServer) {
  //     console.log("Webpack running on client")
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //     config.plugins.push(new BundleAnalyzerPlugin({
  //       analyzerMode: "static",
  //       reportFilename: "./bundle-analysis-report.html"
  //     }))
  //   } else {
  //     console.log("Webpack running on server mode.")
  //   }
  // }
};

export default withPlaiceholder(withMDX(config));
