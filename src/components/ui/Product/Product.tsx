import Image from "next/image";
import { AspectRatio } from "../aspect-ratio";
import { getURL } from "~/utils/utils";
import Link from "next/link";

type ProductData = {
  title: string;
  description?: string;
  downloadLink: string;
  imageSrc?: string;
  variant?: "default" | "large";
};

export default function Product({ product }: { product: ProductData }) {
  const productImageURL = product.imageSrc
    ? `/${product.imageSrc}`
    : `${getURL()}/placeholder.jpg`;

  const imageSize = product.variant === "default" ? 200 : 350;

  return (
    <div
      className={`flex   ${product.variant === "default" ? "w-64 flex-col" : "w-auto sm:flex-row flex-col"} rounded-lg`}
    >
      <Image
        src={productImageURL}
        className="rounded-2xl"
        alt={""}
        width={imageSize}
        height={imageSize}
      />

      <div className=" flex flex-col rounded-lg p-1">
        <Link
          className=" text-lg font-semibold"
          href={`/downloads/${product.title}`}
        >
          {product.title}
        </Link>
        <Link
          className="text-muted-foreground"
          href={`/downloads/${product.title}`}
        >
          {product.description}
        </Link>
        <a
          href={product.downloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-24 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          Download
        </a>
      </div>
    </div>
  );
}
