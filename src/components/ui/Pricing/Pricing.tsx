"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

type PricingPlan = {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
};

export const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"M" | "A">("M");

  const Heading = () => (
    <div className="relative z-10 my-12 flex flex-col items-center justify-center gap-4 bg-black">
      <div className="flex w-full flex-col items-start justify-center space-y-4 md:items-center">
        <div className="mb-2 inline-block rounded-full border-2 bg-colors-background-950 px-2 py-[0.20rem] text-xs font-medium uppercase text-colors-primary-500">
          {" "}
          Pricing
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-colors-text-50 sm:text-4xl">
          Fair pricing, unfair advantage.
        </p>
        <p className="text-md max-w-xl text-colors-text-200 md:text-center">
          Get started with Playportal today
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBillingCycle("M")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            billingCycle === "M"
              ? "relative bg-colors-primary-500 text-white"
              : "text-colors-text-700 hover:bg-colors-primary-100"
          }`}
        >
          Monthly
          {billingCycle === "M" && <BackgroundShift shiftKey="monthly" />}
        </button>
        <button
          onClick={() => setBillingCycle("A")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            billingCycle === "A"
              ? "text relative bg-colors-primary-500 text-white"
              : "text-colors-text-700 hover:bg-colors-primary-100"
          }`}
        >
          Annual
          {billingCycle === "A" && <BackgroundShift shiftKey="annual" />}
        </button>
      </div>
    </div>
  );

  const PricingCards = ({ pricingPlans }: { pricingPlans: PricingPlan[] }) => (
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:gap-4">
      {pricingPlans.map((plan, index) => (
        <div
          key={index}
          className=" h-full w-full rounded-xl border-[1px] border-colors-accent-300 bg-black  p-2 text-left"
        >
          <p className="font- mb-1 mt-0 text-sm font-bold uppercase text-colors-primary-500">
            {plan.name}
          </p>
          <p className="my-0 mb-6 text-sm text-colors-text-50">
            {plan.description}
          </p>
          <div className="mb-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={billingCycle === "M" ? "monthly" : "annual"}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="my-0 text-3xl font-semibold text-gray-900"
              >
                <span>
                  {billingCycle === "M" ? plan.monthlyPrice : plan.annualPrice}
                </span>
                <span className="text-sm font-medium">
                  /{billingCycle === "M" ? "month" : "year"}
                </span>
              </motion.p>
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.985 }}
              className="mt-8 w-full rounded-lg bg-colors-primary-500 py-2 text-sm font-medium text-white hover:bg-colors-primary-500/90"
            >
              Get Started
            </motion.button>
          </div>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="mb-3 flex items-center gap-2">
              <Check className="text-violet-500" size={18} />
              <span className="text-sm text-colors-text-50">{feature}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-black py-12 text-colors-text-50 lg:px-2 lg:py-12">
      <Heading />
      <PricingCards
        pricingPlans={[
          {
            name: "Basic",
            description:
              "For those who simply want our video creation service.",
            annualPrice: 49.99,
            monthlyPrice: 4.99,
            features: ["Create 3 Videos per day."],
          },
          {
            name: "Standard",
            description:
              "Increased video creation quota & access to our thumbnail curation system.",
            annualPrice: 99.99,
            monthlyPrice: 9.99,
            features: [
              "Create 10 Videos per day.",
              "Generate 30 Thumbnails per day.",
            ],
          },
          {
            name: "Premium",
            description:
              "Full access to all of Playportal's functionality, for those with big plans.",
            annualPrice: 199.99,
            monthlyPrice: 19.99,
            features: [
              "Create 25 Videos per day.",
              "Generate 100 Thumbnails per day.",
              "AI-Assisted SEO & Tag recommendations.",
              "Description templating system.",
            ],
          },
        ]}
      />
    </section>
  );
};

const BackgroundShift = ({ shiftKey }: { shiftKey: string }) => (
  <motion.span
    key={shiftKey}
    layoutId="bg-shift"
    className="absolute inset-0 -z-10 rounded-lg bg-colors-secondary-500"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  />
);

export default function PricingPage() {
  return <Pricing />;
}
