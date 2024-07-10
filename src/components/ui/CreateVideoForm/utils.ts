import localFont from "next/font/local";
import { ErrorCode } from "react-dropzone";
import { type z } from "zod";
import { Fonts } from "~/definitions/api-schemas";
import { CreateVideoFormTextOverlaySchema } from "~/definitions/form-schemas";

export function getFileDropErrorMessage(
  fileType: "audio" | "image",
  error: ErrorCode | null,
  allowedFileSizeBytes: number,
  allowedFileExtensions: string[],
) {
  switch (error) {
    case ErrorCode.FileTooLarge:
      return `File size exceeds your plan's limit of ${(allowedFileSizeBytes / 1024 / 1024).toFixed(2)} MB`;
    case ErrorCode.FileInvalidType:
      return `Invalid file type. Please upload a ${allowedFileExtensions.join(", ")} file.`;
    case null:
      return `Something went wrong. Please ensure you are uploading a valid ${fileType} file.`;
    default:
      return "Error";
  }
}

export function hexToRGBA(hex: string, opacity: number) {
  // Remove the hash at the start if it's there
  hex = hex.replace("#", "");

  // Parse the r, g, b values
  const r = parseInt(
    hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2),
    16,
  );
  const g = parseInt(
    hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4),
    16,
  );
  const b = parseInt(
    hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6),
    16,
  );

  // Return the RGBA color string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const getFontClassName = (font: Fonts) => {
  switch (font) {
    case Fonts.Apollo:
      return apollo.className;
    case Fonts.Europa:
      return europa.className;
    case Fonts.Memory:
      return memory.className;
    case Fonts.Sketch:
      return sketch.className;
    case Fonts.Poros:
      return poros.className;
    case Fonts.MontserratBold:
      return montserratBold.className;
    case Fonts.MontserratRegular:
      return montserratRegular.className;
    case Fonts.RobotoMedium:
      return robotMedium.className;
    case Fonts.RobotoBlack:
      return robotoBlack.className;
    case Fonts.RobotoBold:
      return robotoBold.className;
  }
};

export const getFontSize = (size: "Small" | "Medium" | "Large"): number => {
  switch (size) {
    case "Small":
      return 72;
    case "Medium":
      return 104;
    case "Large":
      return 136;
    default:
      return 104;
  }
};

const apollo = localFont({
  src: "../../../../public/fonts/Apollo.ttf",
});

const montserratBold = localFont({
  src: "../../../../public/fonts/Montserrat-Bold.ttf",
});

const montserratRegular = localFont({
  src: "../../../../public/fonts/Montserrat-Regular.ttf",
});

const europa = localFont({
  src: "../../../../public/fonts/Europa.ttf",
});

const memory = localFont({
  src: "../../../../public/fonts/Memory.ttf",
});

const sketch = localFont({
  src: "../../../../public/fonts/Sketch.ttf",
});

const poros = localFont({
  src: "../../../../public/fonts/Poros.ttf",
});

const robotMedium = localFont({
  src: "../../../../public/fonts/Roboto-Medium.ttf",
});

const robotoBold = localFont({
  src: "../../../../public/fonts/Roboto-Bold.ttf",
});

const robotoBlack = localFont({
  src: "../../../../public/fonts/Roboto-Black.ttf",
});

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
export function isTextOverlayFormDataObject(
  value: unknown,
): value is z.infer<typeof CreateVideoFormTextOverlaySchema> {
  const parseResult = CreateVideoFormTextOverlaySchema.safeParse(value);
  console.log(parseResult, "parseResult");
  return parseResult.success;
}
