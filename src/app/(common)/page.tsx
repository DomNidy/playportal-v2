/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Link from "next/link";
import styledGridlines from "../../../public/styled-gridlines.svg";
import dashboardPreview from "../../../public/dashboard-preview.webp";
import clockIcon from "../../../public/clock-icon.svg";
import Image from "next/image";
import { TextGenerateEffect } from "~/components/ui/LandingPage/TextGenerateEffect";
import { ContainerScroll } from "~/components/ui/LandingPage/ContainerScrollAnimation";
import { Tabs } from "~/components/ui/LandingPage/Tabs";
import PricingSection from "~/components/ui/LandingPage/PricingSection";

export default function Home() {
  return (
    <main className="mt-10   flex  min-h-screen flex-col  items-center  bg-black ">
      {/* The styled grid lines */}
      <Image
        src={styledGridlines}
        alt="styled gridlines"
        className="pointer-events-none invisible absolute top-0 lg:visible"
      />

      {/* Hero text section*/}
      <TextGenerateEffect
        words="The social media automation platform for music producers."
        className="mt-24 max-w-[400px] text-center text-[1.95rem] font-semibold leading-[3.25rem] text-white md:mt-36 md:max-w-[655px] md:text-[2.5rem] lg:mt-40 "
      />

      {/* This div will fade in by setting opacity-0 due to the animte call in the container scroll component*/}
      <div className="mt-10 flex flex-row gap-8 opacity-0 ">
        <Link
          className="cursor-pointer rounded-3xl bg-white px-6 py-2 font-bold text-black transition-colors duration-100 hover:bg-white/90"
          href={"/sign-up"}
        >
          Get started
        </Link>{" "}
        <Link
          className="bg-p rounded-3xl bg-ptl_accent-def px-6 py-2 font-bold  text-white transition-colors duration-100 hover:bg-ptl_accent-hover"
          href={"#features"}
        >
          View features
        </Link>
      </div>

      {/* Dashboard hero image section */}

      <ContainerScroll>
        <Image
          src={dashboardPreview}
          alt=""
          className="mt-12 w-[600px] md:mt-28 lg:w-[700px]"
        />
      </ContainerScroll>

      <div className="flex flex-col items-center gap-3 lg:w-[900px]">
        <h2 className="max-w-[400px] text-center text-3xl font-semibold tracking-tighter text-white md:max-w-[600px] md:text-4xl">
          Focus on the music only, Create SEO{" "}
          <span className="text-ptl_accent-def">optimized</span> videos in
          seconds
          <Image
            src={clockIcon}
            alt="clock icon"
            className="mb-1 ml-2 inline"
          />
        </h2>

        <p className="mt-8 px-8 text-left leading-7 text-[#F3F3F3] sm:w-2/3 sm:px-0 lg:text-justify">
          Creating videos for music can be a time-consuming process, and as
          music producers, it{"'"}s not always where we want to focus our
          efforts. Platforms like YouTube and TikTok are incredibly powerful for
          marketing beats online, so we often feel compelled to post content on
          them. However, this additional overhead can lead to burnout, taking
          away from our true passion- creating music.
        </p>
      </div>

      <div id="features" />
      <div className="mt-44 flex flex-col items-center gap-3 lg:w-[900px]">
        <h2 className="w-2/3 text-center text-3xl font-semibold tracking-tighter text-white md:text-4xl">
          What can <span className="text-ptl_accent-def">Playportal</span> offer
          you?
        </h2>

        <Tabs
          containerClassName="mt-8 "
          activeTabClassName="text-black"
          tabs={[
            {
              title: "Create videos",
              value: "videos",
              content: (
                <div className="flex flex-col items-center">
                  <p className="max-w-[600px] text-center leading-7 text-[#F3F3F3] lg:text-justify">
                    Upload an audio file & image file, click a button, and your
                    editing process is done!
                  </p>
                  <Image
                    src={dashboardPreview}
                    alt=""
                    className="w-[600px] lg:w-[700px] "
                  />
                </div>
              ),
            },
            {
              title: "Video Presets",
              value: "videoPresets",
              content: (
                <div className="flex flex-col items-center">
                  <p className="max-w-[600px] text-center leading-7 text-[#F3F3F3] lg:text-justify ">
                    Want to upload content to Platforms such as TikTok with the
                    correct aspect ratio? We have presets which create the video
                    with the optimal aspect ratio for short-form video content.
                  </p>
                  <Image
                    src={dashboardPreview}
                    alt=""
                    className="w-[600px] lg:w-[700px] "
                  />
                </div>
              ),
            },
            {
              title: "Video Tags",
              value: "videoTags",
              content: (
                <div className="flex flex-col items-center">
                  <p className="max-w-[600px] text-center leading-7 text-[#F3F3F3] lg:text-justify ">
                    Quickly generate high quality tags for your appropriate for
                    your video.
                  </p>
                  <Image
                    src={dashboardPreview}
                    alt=""
                    className="w-[600px] lg:w-[700px] "
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      <div id="pricing" />
      <PricingSection />

      <div className=" mt-32 h-32 w-full"></div>
    </main>
  );
}

// const supabase = createClient();

//   const { data: products } = await supabase
//     .from("products_prices")
//     .select("*")
//     .eq("product_active", true)
//     .eq("price_active", true);
{
  /* <PricingPage products={products ?? []} /> */
}
