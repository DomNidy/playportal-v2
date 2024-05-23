"use client";
import React from "react";
import posthog from "posthog-js";
import { type ProductData } from "./Product";

export default function ProductDownloadButton({
  productData,
}: {
  productData: ProductData;
}) {
  return (
    <a
      onClick={() => {
        posthog.capture("download_kit_button_clicked", {
          kit_name: productData.title,
        });
      }}
      href={productData.downloadLink}
      target="_blank"
      rel="noopener noreferrer"
      className="w-24 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
    >
      Download
    </a>
  );
}
