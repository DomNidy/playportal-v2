import Image from "next/image";
import { AspectRatio } from "../aspect-ratio";

type ProductData = {
  title: string;
  description: string;
  downloadLink: string;
  imageSrc: string;
};

export default function Product({ product }: { product: ProductData }) {
  return (
    <div className="flex  w-64 flex-col rounded-lg">
      <AspectRatio ratio={1 / 1}>
        <Image src={product.imageSrc} className="rounded-2xl" alt={""} fill />
      </AspectRatio>

      <div className="mt-2 rounded-lg p-1">
        <h2 className=" text-lg font-semibold">{product.title}</h2>
        <p className="text-muted-foreground">{product.description}</p>
        <a
          href={product.downloadLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </a>
      </div>
    </div>
  );
}
