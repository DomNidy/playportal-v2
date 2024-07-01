import React from "react";
import { useCreateVideoForm } from "../CreateVideoFormContext";
import { useStepper } from "../../Stepper";
import { Controller, useForm } from "react-hook-form";
import { type z } from "zod";
import { CreateVideoFormTextOverlaySchema } from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../Form";
import { Fonts } from "~/definitions/api-schemas";
import { Input } from "../../Input";
import CreateVideoFormActions from "../CreateVideoFormActions";
import { Checkbox } from "../../Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Select";
import { HexColorPicker } from "react-colorful";
import localFont from "next/font/local";
import { zodResolver } from "@hookform/resolvers/zod";
import TextOverlayPreview from "../../TextOverlayPreview";

const apollo = localFont({
  src: "../../../../../public/fonts/Apollo.ttf",
});

const montserratBold = localFont({
  src: "../../../../../public/fonts/Montserrat-Bold.ttf",
});

const montserratRegular = localFont({
  src: "../../../../../public/fonts/Montserrat-Regular.ttf",
});

const europa = localFont({
  src: "../../../../../public/fonts/Europa.ttf",
});

const memory = localFont({
  src: "../../../../../public/fonts/Memory.ttf",
});

const sketch = localFont({
  src: "../../../../../public/fonts/Sketch.ttf",
});

const poros = localFont({
  src: "../../../../../public/fonts/Poros.ttf",
});

const robotMedium = localFont({
  src: "../../../../../public/fonts/Roboto-Medium.ttf",
});

const robotoBold = localFont({
  src: "../../../../../public/fonts/Roboto-Bold.ttf",
});

const robotoBlack = localFont({
  src: "../../../../../public/fonts/Roboto-Black.ttf",
});

function hexToRGBA(hex: string, opacity: number) {
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

const getFontClassName = (font: Fonts) => {
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

const getFontSize = (size: "Small" | "Medium" | "Large"): number => {
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

export default function TextOverlayOptionsFormStep() {
  const {
    uploadVideoOptionsFormStep,
    textOverlayFormStep,
    setTextOverlayFormStep,
    isConfigureTextOverlayChecked,
    imageObjectURL,
    isShowBackgroundTextBoxChecked,
    setIsShowBackgroundTextBoxChecked,
    setIsConfigureTextOverlayChecked,
  } = useCreateVideoForm();
  const { nextStep } = useStepper();
  const form = useForm<z.infer<typeof CreateVideoFormTextOverlaySchema>>({
    resolver: zodResolver(CreateVideoFormTextOverlaySchema),
    defaultValues: {
      text:
        textOverlayFormStep?.text ??
        uploadVideoOptionsFormStep?.videoTitle ??
        "",
      backgroundBox: true,
      backgroundBoxColor: "black",
      backgroundBoxOpacity: 0.75,
      backgroundBoxPadding: 10,
      font: Fonts.RobotoBlack,
      fontColor: "white",
      fontSize: 104,
    },
    values: {
      text:
        textOverlayFormStep?.text ??
        uploadVideoOptionsFormStep?.videoTitle ??
        "",
      font: textOverlayFormStep?.font ?? Fonts.RobotoBlack,
      fontSize: textOverlayFormStep?.fontSize ?? 104,
      fontColor: textOverlayFormStep?.fontColor ?? "white",
      backgroundBox: textOverlayFormStep?.backgroundBox ?? true,
      backgroundBoxColor: textOverlayFormStep?.backgroundBoxColor ?? "black",
      backgroundBoxOpacity: textOverlayFormStep?.backgroundBoxOpacity ?? 0.75,
      backgroundBoxPadding: textOverlayFormStep?.backgroundBoxPadding ?? 20,
    },
  });

  const onSubmit = (data: z.infer<typeof CreateVideoFormTextOverlaySchema>) => {
    setTextOverlayFormStep(isConfigureTextOverlayChecked ? data : null);
    nextStep();
  };

  return (
    <Form {...form}>
      <form
        className="z-[46] mb-8 w-full space-y-4 rounded-lg border-2 bg-black p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-row items-center gap-4">
          <FormLabel className="text-lg">Show text overlay on video?</FormLabel>
          <Checkbox
            checked={isConfigureTextOverlayChecked}
            onCheckedChange={() =>
              setIsConfigureTextOverlayChecked(!isConfigureTextOverlayChecked)
            }
          />
        </div>

        {isConfigureTextOverlayChecked && (
          <div className="flex w-full flex-col items-center space-y-2 ">
            <FormLabel>Text Preview</FormLabel>
            <FormDescription>
              The scale of the elements shown in this preview may not be
              entirely accurate.
            </FormDescription>

            <TextOverlayPreview
              imageObjectURL={imageObjectURL}
              textNode={
                <div
                  className={`absolute top-0 flex h-full w-full flex-col items-center justify-center `}
                >
                  <div
                    className=" flex h-fit w-fit flex-col items-center justify-center"
                    style={{
                      backgroundColor: `${hexToRGBA(textOverlayFormStep?.backgroundBoxColor ?? "#000000", textOverlayFormStep?.backgroundBoxOpacity ?? 0.75)}`,
                      padding: `${textOverlayFormStep?.backgroundBoxPadding ?? 10}px`,
                    }}
                  >
                    <p
                      className={`${getFontClassName(
                        textOverlayFormStep?.font ?? Fonts.RobotoBlack,
                      )} left-5 right-20 z-50`}
                      style={{
                        fontSize: `${(textOverlayFormStep?.fontSize ?? 104) / 36}vw`,
                        color: textOverlayFormStep?.fontColor ?? "white",
                      }}
                    >
                      {form.getValues("text") ?? "My beat"}
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        )}

        {isConfigureTextOverlayChecked && (
          <div className="flex flex-col">
            <div className="flex flex-col items-start justify-between gap-2 md:flex-row">
              <FormField
                defaultValue={textOverlayFormStep?.text ?? ""}
                shouldUnregister={true}
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My beat"
                        {...field}
                        onChange={(v) => {
                          field.onChange(v);

                          setTextOverlayFormStep((prev) => ({
                            ...prev,
                            text: v.target.value,
                          }));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Text to overlay on the video
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.text?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                shouldUnregister={true}
                name="fontSize"
                defaultValue={textOverlayFormStep?.fontSize ?? 104}
                render={({ field }) => (
                  <div className="z-[47] space-y-2">
                    <FormLabel>Font Size</FormLabel>
                    <Select
                      disabled={field.disabled}
                      name={field.name}
                      value={textOverlayFormStep?.fontSize?.toString() ?? "104"}
                      onValueChange={(value) => {
                        const parsedNum = parseInt(value, 10) ?? 52;
                        setTextOverlayFormStep((prev) => ({
                          ...prev,
                          fontSize: parsedNum,
                        }));

                        field.onChange(parsedNum);
                      }}
                    >
                      <SelectTrigger
                        className="w-[180px]"
                        ref={field.ref}
                        onBlur={field.onBlur}
                      >
                        <SelectValue placeholder="Video preset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          key={"Small"}
                          value={getFontSize("Small").toString()}
                        >
                          Small
                        </SelectItem>
                        <SelectItem
                          key={"Medium"}
                          value={getFontSize("Medium").toString()}
                        >
                          Medium
                        </SelectItem>
                        <SelectItem
                          key={"Large"}
                          value={getFontSize("Large").toString()}
                        >
                          Large
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How large should the text be
                    </FormDescription>
                  </div>
                )}
              />

              <Controller
                control={form.control}
                shouldUnregister={true}
                name="font"
                render={({ field }) => (
                  <div className="z-[47] space-y-2">
                    <FormLabel>Font</FormLabel>
                    <Select
                      defaultValue={Fonts.MontserratBold}
                      value={textOverlayFormStep?.font ?? Fonts.MontserratBold}
                      onValueChange={(value) => {
                        // Check if the value is a valid preset
                        if (
                          value in
                          CreateVideoFormTextOverlaySchema.shape.font.enum
                        ) {
                          form.setValue("font", value as Fonts);
                          setTextOverlayFormStep((prev) => ({
                            ...prev,
                            font: value as Fonts,
                          }));
                          field.onChange(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Video preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(
                          CreateVideoFormTextOverlaySchema.shape.font.enum,
                        ).map((preset) => (
                          <SelectItem key={preset} value={preset}>
                            {preset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Font to use for the text</FormDescription>
                  </div>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Font Color</FormLabel>
                <HexColorPicker
                  onChange={(newColor) => {
                    form.setValue("fontColor", newColor);
                    setTextOverlayFormStep((prev) => ({
                      ...prev,
                      fontColor: newColor,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="flex flex-row items-center gap-4">
              <FormLabel className="text-lg">
                Show background box behind text?
              </FormLabel>
              <Checkbox
                checked={isShowBackgroundTextBoxChecked}
                onCheckedChange={() =>
                  setIsShowBackgroundTextBoxChecked(
                    !isShowBackgroundTextBoxChecked,
                  )
                }
              />
            </div>

            {isShowBackgroundTextBoxChecked && (
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                <Controller
                  control={form.control}
                  shouldUnregister={true}
                  name="backgroundBoxPadding"
                  render={({ field }) => (
                    <div className="z-[47] space-y-2">
                      <FormLabel>Background Box Padding</FormLabel>
                      <Select
                        name={field.name}
                        disabled={field.disabled}
                        value={
                          textOverlayFormStep?.backgroundBoxPadding?.toString() ??
                          "20"
                        }
                        onValueChange={(value) => {
                          const padAmount = parseInt(value, 10) ?? 10;
                          setTextOverlayFormStep((prev) => ({
                            ...prev,
                            backgroundBoxPadding: padAmount,
                          }));
                          field.onChange(padAmount);
                        }}
                      >
                        <SelectTrigger
                          className="w-[180px]"
                          ref={field.ref}
                          onBlur={field.onBlur}
                        >
                          <SelectValue placeholder="Medium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key={"Small"} value={"10"}>
                            Small
                          </SelectItem>
                          <SelectItem key={"Medium"} value={"20"}>
                            Medium
                          </SelectItem>
                          <SelectItem key={"Large"} value={"30"}>
                            Large
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Vertical padding for the background text box
                      </FormDescription>
                    </div>
                  )}
                />

                <div className="space-y-2">
                  <Controller
                    name="backgroundBoxOpacity"
                    defaultValue={
                      textOverlayFormStep?.backgroundBoxOpacity ?? 0.75
                    }
                    control={form.control}
                    render={({ field }) => (
                      <div className="z-[47] space-y-2">
                        <FormLabel>Background Box Opacity</FormLabel>
                        <Input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setTextOverlayFormStep((prev) => ({
                              ...prev,
                              backgroundBoxOpacity: value,
                            }));
                            field.onChange(value);
                          }}
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Background Box Color</FormLabel>
                  <HexColorPicker
                    onChange={(newColor) => {
                      form.setValue("backgroundBoxColor", newColor);
                      setTextOverlayFormStep((prev) => ({
                        ...prev,
                        backgroundBoxColor: newColor,
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <CreateVideoFormActions />
      </form>
    </Form>
  );
}
