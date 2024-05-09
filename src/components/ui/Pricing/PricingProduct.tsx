import { Check } from "lucide-react";
import React from "react";
import { type ProductWithParsedMetadata } from "./Pricing";
import { Button } from "../Button";

export default function PricingProduct({
  product,
}: {
  product: ProductWithParsedMetadata;
}) {
  return (
    <div className=" flex h-[300px] w-full flex-col items-start rounded-xl border-[1px] border-colors-accent-300 bg-black px-4 py-2 text-left">
      <p className="font- mb-1 mt-0 text-sm font-bold uppercase text-colors-primary-500">
        {product.name}
      </p>
      <p className="my-0 mb-6 text-sm text-colors-text-50">
        {product.description}
      </p>
      <div className="mb-3 flex flex-col items-start gap-2">
        <div className="flex flex-row gap-2">
          <Check className="text-violet-500" size={18} />
          <span className="text-sm text-colors-text-50">
            Create {product.parsedMetadata.videos_per_day} Videos per day.
          </span>
        </div>

        {product.parsedMetadata.thumbnails_per_day && (
          <div className="flex flex-row gap-2">
            <Check className="text-violet-500" size={18} />
            <span className="text-sm text-colors-text-50">
              Create {product.parsedMetadata.thumbnails_per_day} Thumbnails per
              day.
            </span>
          </div>
        )}
      </div>

      <Button className="mt-auto w-full self-center bg-white">Subscribe</Button>
    </div>
  );
}
