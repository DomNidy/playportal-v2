import { type Tables } from "types_db";
import PricingProduct from "./PricingProduct";
import { StripeProductMetadataSchema } from "~/definitions/product-metadata-schemas";
import { type z } from "zod";
import { createClient } from "~/utils/supabase/server";

export type ProductWithPriceAndParsedMetadata = Omit<
  Tables<"products_prices">,
  "metadata"
> & {
  parsedMetadata: z.infer<typeof StripeProductMetadataSchema>;
};

export default async function PricingPage({
  products,
}: {
  products: Tables<"products_prices">[];
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const productsWithMetadata: ProductWithPriceAndParsedMetadata[] = [];
  products.forEach((product) => {
    if (StripeProductMetadataSchema.safeParse(product.metadata).success) {
      productsWithMetadata.push({
        parsedMetadata: product.metadata as z.infer<
          typeof StripeProductMetadataSchema
        >,
        product_active: product.product_active,
        description: product.description,
        product_id: product.product_id ?? "",
        currency: product.currency,
        interval: product.interval,
        price_active: product.price_active,
        price_id: product.price_id,
        unit_amount: product.unit_amount,
        image: product.image,
        name: product.name,
        interval_count: product.interval_count,
        price_metadata: product.price_metadata,
        price_type: product.price_type,
        trial_period_days: product.trial_period_days,
      });
    }
  });

  return (
    <div className=" z-10 flex w-full max-w-6xl flex-col gap-8 md:w-[700px] md:flex-row lg:gap-4">
      {productsWithMetadata
        .sort((a, b) => a.parsedMetadata.tier - b.parsedMetadata.tier)
        .map((product, idx) => (
          <PricingProduct product={product} key={idx} user={user} />
        ))}
    </div>
  );
}
