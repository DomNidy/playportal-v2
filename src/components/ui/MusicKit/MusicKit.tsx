import Image from "next/image";
import { getURL } from "~/utils/utils";
import { Link } from "~/components/ui/Link";
import MusicKitDownloadButton from "./MusicKitDownloadButton";
import { getBlurData } from "~/utils/blur-data-generator";

export type KitData = {
  title: string;
  description?: string | null;
  downloadURL: string;
  imageSrc?: string | null;
  variant?: "default" | "large";
};

export default async function MusicKit({ ...kit }: KitData) {
  const { title, description, imageSrc, variant } = kit;

  const productImageURL = imageSrc
    ? `${getURL()}/${kit.imageSrc}`
    : `${getURL()}/placeholder.jpg`;

  const imageSize = variant === "default" ? 200 : 350;
  const { base64 } = await getBlurData(productImageURL);

  return (
    <div
      className={`flex ${variant === "default" ? "w-64 flex-col" : "w-auto flex-col gap-2 sm:flex-row"} rounded-lg`}
    >
      {/** Turning off optimization since it seems it causes issues with our blur implementation */}
      <Image
        src={productImageURL}
        className="rounded-2xl"
        alt={`${title} kit image`}
        width={imageSize}
        height={imageSize}
        placeholder="blur"
        blurDataURL={base64}
        unoptimized={true}
        />

      <div className=" flex flex-col rounded-lg p-1">
        <Link className=" text-lg font-semibold" href={`/downloads/${title}`}>
          {title}
        </Link>
        <Link className="text-muted-foreground" href={`/downloads/${title}`}>
          {description}
        </Link>
        <MusicKitDownloadButton {...kit} />
      </div>
    </div>
  );
}
