import { FeatureCard } from "~/components/ui/LandingPage";
import { Footer } from "~/components/ui/Footer";
import {
  AudioLinesIcon,
  CheckCircle2,
  Laptop,
  Monitor,
  Music2Icon,
  PenLine,
  PlayCircle,
  Smartphone,
  VideoIcon,
} from "lucide-react";
import Image from "next/image";
import PricingSection from "~/components/ui/LandingPage/PricingSection";
import React, { Suspense } from "react";
import PricingCardSkeleton from "~/components/ui/PricingCard/PricingCardSkeleton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-neutral-950">
      {" "}
      {/** Hero container */}
      <div className="landing-grad z-10 flex h-full min-h-[800px] w-full flex-col items-center px-4">
        {/** TODO: This hero text needs to stay vertically centered when the screen grows */}
        <div className="flex max-w-[1000px] translate-y-24 flex-col items-center gap-4 self-center text-center md:translate-y-36 ">
          <h1 className="text-[51.4px] font-semibold leading-[53px] tracking-tight text-white ">
            Drag and Drop Your Beats, Upload them Anywhere
          </h1>
          <h3 className="text-xl font-light text-white">
            A simple way to automatically create videos with your music, and
            upload them directly to YouTube, or any other platform.
          </h3>
          <button className="mt-6 rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]">
            Create Now
          </button>
          <div className="mt-12 grid grid-cols-1 items-stretch justify-stretch gap-8 px-4 pb-52  text-start md:grid-cols-2  md:pb-72 lg:grid-cols-3 lg:pb-0">
            <FeatureCard
              iconBackgroundColor="bg-red-600 "
              title="Youtube Upload"
              icon={PlayCircle}
              description="Drag in your file, and it will be uploaded to your channel in moments."
            />
            <FeatureCard
              icon={AudioLinesIcon}
              iconBackgroundColor="bg-green-600"
              title="Lossless Quality"
              description="Your videos will be uploaded in maximum quality."
            />

            <FeatureCard
              iconBackgroundColor="bg-violet-600"
              title="SEO Helpers"
              icon={CheckCircle2}
              description="Generate tags and titles with our tools, create description templates."
            />
          </div>
        </div>

        {/* <div className="video-container -z-10 w-full ">
          <video
            src="/trailer-hero.mp4"
            autoPlay
            muted
            loop
            className="object-cover overflow-hidden h-full w-full aspect-auto"
          />
        </div> */}
      </div>
      {/** TODO: Items center on the praent is causing this to be centered as well, we don't want that, it causes the issue */}
      {/** Video container */}
      {/** TODO: This needs to be relative positioned because this makes the video be placed properly inside the container, h-900px needs to match the hero height */}
      <div className="w-full bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="flex flex-col items-center justify-start">
          <Image
            src={"/landing/dash-preview.png"}
            width={1063}
            height={735}
            quality={100}
            alt="Preview image"
            className="relative  z-40 -translate-y-8"
          />
        </div>
      </div>
      <div className="my-24 flex w-full flex-col items-center justify-center bg-neutral-950">
        <div className="container flex flex-col  items-start  gap-8 md:flex-row md:justify-between ">
          <div>
            <h2 className="text-center text-4xl font-bold md:max-w-[300px] md:text-left">
              Grow your music career, and be more consistent with uploads
            </h2>
          </div>

          <div>
            <p className=" leading-7 tracking-wide md:max-w-[510px] md:text-right">
              Sometimes, the additional overhead of manually editing your videos
              can take away time from your music production. This can make it
              easy to skip uploads, (which is the most important thing when it
              comes to growing your channel). With Playportal, this process
              becomes a painless experience.
            </p>
          </div>
        </div>
        <div className="container  flex justify-center md:justify-end">
          <button className="mt-6 rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]">
            Get Started
          </button>
        </div>
        <div className="container mt-12 grid grid-cols-1 items-stretch justify-stretch gap-8   text-start md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={PenLine}
            iconBackgroundColor="bg-rose-600"
            title="No Editing Required"
            description="Ditch the slow editing software. No need to wait for rendering."
          />

          <FeatureCard
            title="Upload Anywhere"
            icon={VideoIcon}
            iconBackgroundColor="bg-emerald-600"
            description="We offer automatic uploads to YouTube, but you can easily download your video and upload it anywhere."
          />

          <FeatureCard
            title="Make more Music"
            icon={Music2Icon}
            iconBackgroundColor="bg-indigo-600"
            description="Streamline your workflow and make more music."
          />
        </div>
      </div>
      <div className="h-[2px] w-full bg-white/10" />
      <div className="w-full bg-neutral-900 ">
        <div className="container my-8 flex h-full w-full  flex-col items-center justify-between gap-4 px-4 md:my-24 md:flex-row-reverse md:items-start">
          <div className="flex max-w-[26rem]  flex-col items-center gap-8 md:items-start">
            <div className="flex  flex-row gap-4">
              <h2 className="text-left text-4xl font-bold">Tag Generator</h2>
              <p className="tracking inline w-fit self-center rounded-xl bg-gradient-to-r from-orange-600  to-red-500 p-2 text-center text-xs font-semibold">
                NEW FEATURE
              </p>
            </div>
            <div className="flex flex-row  items-center gap-2 leading-7 text-neutral-300">
              <p>
                Generate up-to-date, <strong>SEO Optimized</strong> video tags
                directly sourced from YouTube.
              </p>
            </div>
            <Link
              href={"/sign-up"}
              className="mt-6  rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]"
            >
              Create Now
            </Link>
          </div>
          <div className="w-full max-w-[360px] rounded-lg bg-gradient-to-r from-orange-600 to-red-500 p-4">
            <Image
              src="/landing/tag-gen.svg"
              alt="Tag generator"
              width={500}
              quality={100}
              height={300}
              className="  mt-4 aspect-square h-auto  w-full self-center"
            />
          </div>
        </div>
      </div>
      <div className="h-[2px] w-full bg-white/10" />
      <div className="w-full bg-neutral-900 ">
        <div className="container my-8 flex h-full w-full  flex-col items-center justify-between gap-4 px-4 md:my-24 md:flex-row md:items-start">
          <div className="flex max-w-[26rem]  flex-col items-center gap-8 md:items-start">
            <div className="flex  flex-row gap-4">
              <h2 className="text-left  text-4xl font-bold">Title Builder</h2>
              <p className="tracking inline w-fit self-center rounded-xl bg-gradient-to-r from-blue-500  to-indigo-600 p-2 text-center text-xs font-semibold">
                NEW FEATURE
              </p>
            </div>
            <div className="flex flex-row  items-center gap-2 leading-7 text-neutral-300">
              <p>
                Create the perfect titles for your videos with our title
                builder. Select artist names and or descriptive keywords, the
                availability of the beat (free, free for profit, no label).
              </p>
            </div>
            <Link
              href={"/sign-up"}
              className="mt-6  rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]"
            >
              Create Now
            </Link>
          </div>
          <div className="w-full max-w-[360px] rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <Image
              src="/landing/title-builder.png"
              alt="Title builder overlay"
              width={500}
              height={300}
              className="mt-4 h-auto w-full self-center"
            />
          </div>
        </div>
      </div>
      <div className="h-[2px] w-full bg-white/10" />
      <div className="w-full bg-neutral-950 ">
        <div className="container my-8 flex h-full w-full  flex-col items-center justify-between gap-4 px-4 md:my-24 md:flex-row-reverse md:items-start">
          <div className="flex max-w-[26rem]  flex-col items-center gap-8 md:max-w-[35rem] md:items-start">
            <div className="flex flex-row gap-4">
              <h2 className="text-center text-4xl font-bold md:text-left">
                Description Templates
              </h2>
              <p className="tracking inline w-fit self-center rounded-xl bg-gradient-to-r from-orange-600  to-red-500 p-2 text-center text-xs font-semibold">
                NEW FEATURE
              </p>
            </div>
            <div className="flex flex-row  items-center gap-2 leading-7 text-neutral-300">
              <p>
                Create and save description templates for your YouTube video
                uploads, and quickly select them whenever you upload a new
                video. A/B test your descriptions to see what works best, and
                link your socials.
              </p>
            </div>
            <Link
              href={"/sign-up"}
              className="mt-6  rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]"
            >
              Create Now
            </Link>
          </div>
          <div className="w-full max-w-[360px] rounded-lg  bg-gradient-to-r from-orange-600 to-red-500 p-4 text-center ">
            <Image
              src="/landing/description-template.png"
              alt="Description templates"
              width={500}
              height={500}
              className="mt-4 h-auto w-full  self-center"
            />
          </div>
        </div>
      </div>
      <div className="h-[2px] w-full bg-white/10" />
      <div className="w-full bg-neutral-950 ">
        <div className="container my-8 flex h-full w-full  flex-col items-center justify-between gap-4 px-4 md:my-24 md:flex-row md:items-start">
          <div className="flex max-w-[26rem]  flex-col items-center gap-6 md:items-start">
            <h2 className="text-center text-4xl font-bold md:text-left">
              Custom text overlay
            </h2>
            <div className="flex flex-row items-center gap-2 text-neutral-300">
              <p>
                Configure a text overlay to stay consistent with your channels
                {"' "}
                aesthetic.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 grid-rows-3 items-stretch justify-stretch gap-8 md:grid-cols-3 md:grid-rows-1">
              <p className="h-full w-full content-center  rounded-xl bg-gradient-to-r from-rose-600 to-red-500 p-2 text-center font-medium tracking-tighter">
                Select a Font
              </p>{" "}
              <p className="h-full w-full content-center self-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 text-center font-medium tracking-tighter">
                Select a Color
              </p>
              <p className="h-full w-full  content-center self-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 p-2  text-center font-medium tracking-tighter">
                Select a Size
              </p>{" "}
            </div>
            <Link
              href={"/sign-up"}
              className="mt-6  rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]"
            >
              Create Now
            </Link>
          </div>
          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <Image
              src="/landing/text-overlay.png"
              alt="Custom text overlay"
              width={500}
              quality={100}
              height={300}
              className="mt-4 h-auto w-full max-w-[500px] self-center "
            />
          </div>
        </div>
      </div>
      <div className="h-[2px] w-full bg-white/10" />
      <div className="w-full bg-neutral-900 bg-gradient-to-r from-neutral-900 to-neutral-950 ">
        <div className="container my-8 flex h-full w-full flex-col items-center justify-between gap-4 md:my-24 md:flex-row md:items-start">
          <div className="flex flex-col  items-center gap-8 md:items-start">
            <h2 className="mb-8 text-center text-4xl font-bold md:text-left">
              Upload anywhere, from anywhere
            </h2>
            <div className="flex flex-row items-center gap-2">
              <Smartphone className="h-10 w-10 rounded-full bg-rose-600 p-2" />

              <h3 className="gap-2 text-2xl font-normal">
                Upload from your Phone
              </h3>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Monitor className="h-10 w-10 rounded-full bg-emerald-600 p-2" />
              <h3 className="gap-2 text-2xl font-normal">
                Upload from your Desktop
              </h3>
            </div>{" "}
            <div className="flex flex-row items-center gap-2">
              <Laptop className="h-10 w-10 rounded-full bg-indigo-600 p-2" />
              <h3 className="gap-2 text-2xl font-normal">
                Upload from your Laptop
              </h3>
            </div>
            <button className="mt-6  rounded-md bg-[#2175d5] px-12 py-4 tracking-tight text-white shadow-[0_4px_14px_0_rgb(0,118,255,39%)] transition  duration-200 ease-linear hover:bg-[rgba(0,118,255,0.95)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)]">
              Upload Now
            </button>
          </div>
          <video
            src="/landing/video-preview.mp4"
            autoPlay
            muted
            loop
            className=" mt-4 aspect-video h-auto w-full max-w-[500px] self-center"
          />
        </div>
      </div>
      {/* <div className="bg-neutral-950 w-full ">
        <Testimonals />
      </div> */}
      <div className="h-[2px] w-full bg-white/10" />
      <div className=" my-24 flex w-full max-w-[1000px] flex-col bg-neutral-950">
        <h2 className="text-center text-4xl font-bold ">
          Grow your Channel Today
        </h2>
        <div
          className="mt-10 grid w-full grid-cols-1 items-stretch gap-8 px-4 sm:grid-cols-2"
          id="pricing"
        >
          <Suspense
            fallback={
              <>
                <PricingCardSkeleton />
                <PricingCardSkeleton />
              </>
            }
          >
            <PricingSection />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
