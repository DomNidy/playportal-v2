import Image from "next/image";
import React, { type ReactNode } from "react";

interface TextOverlayPreviewProps {
  imageObjectURL: string | null;
  textNode: ReactNode;
}

export default function TextOverlayPreview({
  ...props
}: TextOverlayPreviewProps) {
  const { imageObjectURL, textNode } = props;

  if (!imageObjectURL) {
    return <>{textNode}</>;
  }

  return (
    <div className="relative h-fit w-fit">
      <Image
        src={imageObjectURL}
        alt="Preview image"
        className="object-fill "
        width={600}
        height={350}
      />
      {textNode}
    </div>
  );
}
