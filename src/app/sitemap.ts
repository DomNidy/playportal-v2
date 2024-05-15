import type { MetadataRoute } from "next";
import { getURL } from "~/utils/utils";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${getURL()}`, lastModified: new Date() },
    { url: `${getURL()}/downloads`, lastModified: new Date() },
  ];
}
