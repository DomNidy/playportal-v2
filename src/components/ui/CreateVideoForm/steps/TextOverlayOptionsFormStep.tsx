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

export default function TextOverlayOptionsFormStep() {
  const {
    uploadVideoOptionsFormStep,
    textOverlayFormStep,
    setTextOverlayFormStep,
    isConfigureTextOverlayChecked,
    setIsConfigureTextOverlayChecked,
  } = useCreateVideoForm();
  const { nextStep } = useStepper();
  const form = useForm<z.infer<typeof CreateVideoFormTextOverlaySchema>>({
    resolver: zodResolver(CreateVideoFormTextOverlaySchema),
    defaultValues: {
      backgroundBox: true,
      backgroundBoxColor: "black",
      backgroundBoxOpacity: 0.75,
      backgroundBoxPadding: 10,
      font: Fonts.RobotoBlack,
      fontColor: "white",
      fontSize: 52,
    },
    values: {
      text:
        textOverlayFormStep?.text ??
        uploadVideoOptionsFormStep?.videoTitle ??
        "",
      font: textOverlayFormStep?.font ?? Fonts.RobotoBlack,
      fontSize: textOverlayFormStep?.fontSize ?? 52,
      fontColor: textOverlayFormStep?.fontColor ?? "white",
      backgroundBox: textOverlayFormStep?.backgroundBox ?? true,
      backgroundBoxColor: textOverlayFormStep?.backgroundBoxColor ?? "black",
      backgroundBoxOpacity: textOverlayFormStep?.backgroundBoxOpacity ?? 0.75,
      backgroundBoxPadding: textOverlayFormStep?.backgroundBoxPadding ?? 10,
    },
  });

  const onSubmit = (data: z.infer<typeof CreateVideoFormTextOverlaySchema>) => {
    setTextOverlayFormStep(isConfigureTextOverlayChecked ? data : null);
    nextStep();
  };

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
          <div className="flex flex-col items-start justify-start gap-4 md:flex-row">
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
              render={({ field }) => (
                <div className="z-[47] space-y-2">
                  <FormLabel>Font Size</FormLabel>
                  <Select
                    value={textOverlayFormStep?.fontSize?.toString() ?? "52"}
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
                      <SelectItem key={"Small"} value={"36"}>
                        Small
                      </SelectItem>
                      <SelectItem key={"Medium"} value={"52"}>
                        Medium
                      </SelectItem>
                      <SelectItem key={"Large"} value={"68"}>
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

            <div className="z-[47] space-y-2">
              <FormLabel>Font</FormLabel>
              <Select
                defaultValue={Fonts.MontserratBold}
                value={textOverlayFormStep?.font ?? Fonts.MontserratBold}
                onValueChange={(value) => {
                  // Check if the value is a valid preset
                  if (
                    value in CreateVideoFormTextOverlaySchema.shape.font.enum
                  ) {
                    form.setValue("font", value as Fonts);
                    setTextOverlayFormStep((prev) => ({
                      ...prev,
                      font: value as Fonts,
                    }));
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
        )}

        {isConfigureTextOverlayChecked && (
          <div className="flex flex-col space-y-2">
            <FormLabel>Text Preview</FormLabel>
            <p
              className={getFontClassName(
                textOverlayFormStep?.font ?? Fonts.RobotoBlack,
              )}
              style={{
                fontSize: 24,
                color: textOverlayFormStep?.fontColor ?? "white",
              }}
            >
              {textOverlayFormStep?.text ?? "My beat"}
            </p>
          </div>
        )}

        <CreateVideoFormActions />
      </form>
    </Form>
  );
}
