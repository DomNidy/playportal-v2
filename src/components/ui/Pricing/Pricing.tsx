import PricingProduct from "./PricingProduct";
import { createClient } from "~/utils/supabase/server";
import { type Tables } from "types_db";

export default async function PricingPage({
  products,
}: {
  products: Tables<"products_prices">[];
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className=" z-10 flex w-full max-w-6xl flex-col gap-8 md:w-[700px] md:flex-row lg:gap-4">
      {products
        .sort(
          (a, b) =>
            (a.create_video_daily_quota ?? 0) -
            (b.create_video_daily_quota ?? 0),
        )
        .map((product, idx) => (
          <PricingProduct product={product} key={idx} user={user} />
        ))}
    </div>
  );
}
