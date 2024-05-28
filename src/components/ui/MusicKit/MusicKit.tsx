import Image from "next/image";
import { getURL } from "~/utils/utils";
import Link from "next/link";
import MusicKitDownloadButton from "./MusicKitDownloadButton";

export type KitData = {
  title: string;
  description?: string | null;
  downloadURL: string;
  imageSrc?: string | null;
  variant?: "default" | "large";
};

export default function MusicKit({ ...kit }: KitData) {
  const { title, description, imageSrc, variant } = kit;

  const productImageURL = imageSrc
    ? `/${kit.imageSrc}`
    : `${getURL()}/placeholder.jpg`;

  const imageSize = variant === "default" ? 200 : 350;

  return (
    <div
      className={`flex ${variant === "default" ? "w-64 flex-col" : "w-auto flex-col gap-2 sm:flex-row"} rounded-lg`}
    >
      <Image
        src={productImageURL}
        className="rounded-2xl"
        alt={""}
        width={imageSize}
        height={imageSize}
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
