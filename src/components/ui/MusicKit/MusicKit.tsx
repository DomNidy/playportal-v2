import Image from "next/image";
import { getURL, isRelativeUrl } from "~/utils/utils";
import { Link } from "~/components/ui/Link";
import MusicKitDownloadButton from "./MusicKitDownloadButton";
import { getBlurData } from "~/utils/blur-data-generator";
import { Badge } from "../Badge";
import type { KitType } from "~/definitions/db-type-aliases";

export type KitData = {
  title: string;
  description?: string | null;
  downloadURL: string;
  imageSrc?: string | null;
  variant?: "default" | "large";
  type: KitType;
};

function getBadgeColorFromKitType(kitType: KitType): {
  badgeColor: string;
  badgeHoverColor: string;
} {
  switch (kitType) {
    case "drum-kit":
      return {
        badgeColor: "bg-red-500",
        badgeHoverColor: "bg-red-500/80",
      };
    case "midi-kit":
      return {
        badgeColor: "bg-ptl_accent-def",
        badgeHoverColor: "bg-ptl_accent-def/80",
      };
    case "loop-kit":
      return {
        badgeColor: "bg-cyan-600",
        badgeHoverColor: "bg-cyan-600/80",
      };
    case "preset-kit":
      return {
        badgeColor: "bg-blue-500",
        badgeHoverColor: "bg-blue-500/80",
      };
    case "other":
      return {
        badgeColor: "bg-yellow-500",
        badgeHoverColor: "bg-yellow-500/80",
      };
  }
}

const placeholderImageURL = `${getURL()}/placeholder.jpg`;

// If the url is relative to site, prepend it with site url
// If the url is external, return it as is
const resolveKitImageURL = (kitImageURL: string) =>
  isRelativeUrl(kitImageURL) ? `${getURL()}/${kitImageURL}` : kitImageURL;

export default async function MusicKit({ ...kit }: KitData) {
  const { title, description, imageSrc, variant } = kit;

  const resolvedImageURL = imageSrc
    ? resolveKitImageURL(imageSrc)
    : placeholderImageURL;
  const imageSize = variant === "default" ? 200 : 350;
  const { base64 } = await getBlurData(resolvedImageURL);

  const { badgeColor, badgeHoverColor } = getBadgeColorFromKitType(kit.type);

  return (
    <div
      className={`aspect flex w-[${imageSize}px] ${variant === "default" ? "flex-col" : "w-auto flex-col gap-2 sm:flex-row"} rounded-lg `}
    >
      {/** Turning off optimization since it seems it causes issues with our blur implementation */}
      <Image
        src={resolvedImageURL}
        className="aspect-square rounded-2xl "
        alt={`${title} kit image`}
        width={imageSize}
        height={imageSize}
        placeholder="blur"
        blurDataURL={base64}
        unoptimized={true}
      />

      <div className=" flex flex-col gap-1 rounded-lg p-1 ">
        <Link
          className="mb-0.5 mt-2 flex text-xl font-semibold"
          href={`/downloads/${title}`}
        >
          {title}
          <Badge
            className={`ml-auto w-fit ${badgeColor} hover:${badgeHoverColor} py-[0.5px] font-semibold`}
          >
            {kit.type}
          </Badge>
        </Link>
        <Link
          className="mb-1 text-muted-foreground"
          href={`/downloads/${title}`}
        >
          {description}
        </Link>
        <MusicKitDownloadButton {...kit} />
      </div>
    </div>
  );
}
