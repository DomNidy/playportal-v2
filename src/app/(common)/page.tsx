import { Suspense } from "react";
import FeaturesGrid from "~/components/ui/FeaturesGrid/FeaturesGrid";
import PricingPage from "~/components/ui/Pricing/Pricing";
import Typography from "~/components/ui/Typography";
import { createClient } from "~/utils/supabase/client";

export default async function Home() {
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products_prices")
    .select("*")
    .eq("product_active", true)
    .eq("price_active", true);

  return (
    <main className="flex flex-col items-center bg-black ">
      <div className="mb-14 flex h-[500px]  w-full items-center justify-center bg-gradient-to-b from-black via-[#382963] to-black">
        <Typography variant={"h1"} className="text-center text-4xl font-medium">
          The social media automation platform <br /> for producers
        </Typography>
      </div>
      <Suspense>
        <FeaturesGrid
          features={[
            {
              name: "Automated beat video creation",
              description:
                "You provide the beats, and we'll handle the entire video creation process on our servers.",
              id: 0,
              imageHref: "https://ansubkhan.com/images/projects/syntaxUI.svg",
              link: "",
            },
            {
              name: "AI-Assisted SEO",
              description:
                "We'll analyze the latest trends in the type-beat scene, and recommend keywords & best practices to increase your videos' performance.",
              id: 1,
              imageHref: "https://ansubkhan.com/images/projects/syntaxUI.svg",
              link: "",
            },
            {
              name: "AI-Assisted thumbnail curation",
              description:
                "Finding thumbnails is tedious, utilizing our fine-tuned diffusion model, we can generate thumbnails for your videos in a consistent style; true to your brand.",
              id: 2,
              imageHref: "https://ansubkhan.com/images/projects/syntaxUI.svg",
              link: "",
            },
          ]}
        />
      </Suspense>

      <div className="mt-10"></div>
      <PricingPage products={products ?? []} />
    </main>
  );
}
