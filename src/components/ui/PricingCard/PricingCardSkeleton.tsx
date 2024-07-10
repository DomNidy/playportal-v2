import React from "react";

export default function PricingCardSkeleton() {
  return (
    <div className="flex w-full flex-col animate-pulse items-center rounded-xl border-2 border-white/10">
      <div
        style={{
          backgroundColor: "rgba(22, 22, 22, 1)",
        }}
        className="flex h-[125px] w-full flex-col gap-2 rounded-t-xl"
      ></div>
      <div
        style={{
          backgroundColor: "rgba(20, 20, 20, 1)",
        }}
        className=" flex h-[255px] w-full flex-col items-center justify-evenly gap-4 rounded-b-xl px-4 py-4"
      >
        <div className="w-full p-2 rounded-2xl bg-muted-foreground/10" />
        <div className="w-full p-2 rounded-2xl bg-muted-foreground/10" />
        <div className="w-full p-2 rounded-2xl bg-muted-foreground/10" />
        <div className="w-full p-2 rounded-2xl bg-muted-foreground/10" />
      </div>
    </div>
  );
}
