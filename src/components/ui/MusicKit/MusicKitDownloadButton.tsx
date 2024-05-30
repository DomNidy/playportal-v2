"use client";
import React from "react";
import posthog from "posthog-js";
import { DownloadIcon } from "lucide-react";

type MusicKitDownloadButtonProps = {
  downloadURL: string;
  title: string;
};

export default function MusicKitDownloadButton({
  ...kit
}: MusicKitDownloadButtonProps) {
  const { downloadURL, title } = kit;

  return (
    <a
      onClick={() => {
        posthog.capture("download_kit_button_clicked", {
          kit_name: title,
        });
      }}
      href={downloadURL}
      target="_blank"
      rel="noopener noreferrer"
      className="w-fit rounded-lg flex bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
    >
      Download
      <DownloadIcon
        className="ml-4 text-black inline-flex group-hover:text-white "
        width={20}
        height={20}
      />
    </a>
  );
}
