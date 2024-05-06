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
    <div className="rounded-lg w-64 h-64 flex flex-col">
      <AspectRatio ratio={1 / 1}>
        <Image src={product.imageSrc} className="rounded-2xl" alt={""} fill/>
      </AspectRatio>
      <h2 className="font-semibold text-lg mt-2">{product.title}</h2>
      <p className="text-muted-foreground">{product.description}</p>
      <a href={product.downloadLink} target="_blank" rel="noopener noreferrer" >
        Download
      </a>
    </div>
  );
}
