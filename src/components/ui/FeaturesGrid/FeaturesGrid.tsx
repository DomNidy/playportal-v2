"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Typography from "../Typography";

type Feature = {
  id: number;
  name: string;
  description: string;
  link: string;
  imageHref: string;
};

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        type: "spring",
        bounce: 0.7,
      }}
      key={feature.id}
      className=" h-full w-64 rounded-3xl  bg-gradient-to-b from-colors-accent-300 to-colors-secondary-300 p-[1px] text-left shadow-lg"
    >
      <div className="flex h-full flex-col justify-between gap-2 rounded-3xl bg-black px-4 py-2 ">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col"
          href={feature.link}
        >
          <Image
            src={feature.imageHref}
            width={30}
            height={30}
            className="mb-3 rounded-lg"
            alt={feature.name}
          />
          <Typography variant={"h4"} className="h-[80px] ">
            {feature.name}
          </Typography>
          <p className="text-pretty align-text-bottom text-[15px]  leading-6 text-[#F4F3F3]">
            {feature.description}
          </p>
        </a>
      </div>
    </motion.div>
  );
}

export default function FeaturesGrid({ features }: { features: Feature[] }) {
  return (
    <div className="mx-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard feature={feature} key={feature.id} />
        ))}
      </div>
    </div>
  );
}
