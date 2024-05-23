import Image from "next/image";
import { getURL } from "~/utils/utils";
import Link from "next/link";
import posthog from "posthog-js";
import ProductDownloadButton from "./ProductDownloadButton";

export type ProductData = {
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
      className={`flex   ${product.variant === "default" ? "w-64 flex-col" : "w-auto flex-col gap-2 sm:flex-row"} rounded-lg`}
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
        <ProductDownloadButton productData={product} />
      </div>
    </div>
  );
}
