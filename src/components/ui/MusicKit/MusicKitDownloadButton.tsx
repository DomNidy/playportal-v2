"use client";
import React from "react";
import posthog from "posthog-js";

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
      className="w-24 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
    >
      Download
    </a>
  );
}
