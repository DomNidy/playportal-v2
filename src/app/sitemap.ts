import type { MetadataRoute } from "next";
import { getURL } from "~/utils/utils";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${getURL()}`, lastModified: new Date(), priority: 1 },
    { url: `${getURL()}/downloads`, lastModified: new Date(), priority: 0.45 },
    { url: `${getURL()}/support`, lastModified: new Date(), priority: 0.2 },
  ];
}
