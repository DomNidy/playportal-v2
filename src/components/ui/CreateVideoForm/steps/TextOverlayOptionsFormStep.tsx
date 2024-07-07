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
import { zodResolver } from "@hookform/resolvers/zod";
import TextOverlayPreview from "../../TextOverlayPreview";
import { hexToRGBA, getFontClassName, getFontSize } from "../utils";

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
      font: Fonts.RobotoBlack,
      fontColor: textOverlayFormStep?.fontColor ?? "white",
      fontSize: 104,
      backgroundBoxSettings: {
        backgroundBoxColor:
          textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxColor ??
          "black",
        backgroundBoxOpacity:
          textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxOpacity ??
          0.75,
        backgroundBoxPadding:
          textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxPadding ??
          10,
      },
    },
    values: {
      text:
        textOverlayFormStep?.text ??
        uploadVideoOptionsFormStep?.videoTitle ??
        "",
      font: textOverlayFormStep?.font ?? Fonts.RobotoBlack,
      fontSize: textOverlayFormStep?.fontSize ?? 104,
      fontColor: textOverlayFormStep?.fontColor ?? "white",

      // TODO: This causes error with the uncontrolled components turning into controlled components
      backgroundBoxSettings: isShowBackgroundTextBoxChecked
        ? {
            backgroundBoxColor:
              textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxColor ??
              "black",
            backgroundBoxOpacity:
              textOverlayFormStep?.backgroundBoxSettings
                ?.backgroundBoxOpacity ?? 0.75,
            backgroundBoxPadding:
              textOverlayFormStep?.backgroundBoxSettings
                ?.backgroundBoxPadding ?? 20,
          }
        : undefined,
    },
  });

  console.log(form.getValues(), form.formState.errors);

  const onSubmit = (data: z.infer<typeof CreateVideoFormTextOverlaySchema>) => {
    setTextOverlayFormStep(data);
    nextStep();
  };

  const watchBackgroundBoxColor = form.watch(
    "backgroundBoxSettings.backgroundBoxColor",
    textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxColor ?? "black",
  );

  const watchBackgroundBoxOpacity = form.watch(
    "backgroundBoxSettings.backgroundBoxOpacity",
    textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxOpacity ?? 0.75,
  );

  const watchBackgroundBoxPadding = form.watch(
    "backgroundBoxSettings.backgroundBoxPadding",
    textOverlayFormStep?.backgroundBoxSettings?.backgroundBoxPadding ?? 20,
  );

  // TODO: For some reason, changing the font color, then checking the background box checkbox resets this to its previous value
  // TODO: (previous as in the value it was when this form step was submitted last)
  //* This is because we only update the font color (and some other fields) when the form is submitted
  //* We do this for performance reasons, because updating the context on every change is very inneficient
  //* We probably are going to want to stop using the context outside of the initial useForm call, this may be leading to the issues we are seeing
  const watchFontColor = form.watch(
    "fontColor",
    textOverlayFormStep?.fontColor ?? "white",
  );

  return (
    <Form {...form}>
      <form
        className="z-[46] mb-8 w-full space-y-4 rounded-lg border-2 bg-black p-4"
        onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
      >
        <div className="flex flex-row items-center gap-4">
          <FormLabel className="text-lg">Show text overlay on video?</FormLabel>
          <Checkbox
            checked={isConfigureTextOverlayChecked}
            onCheckedChange={() => {
              setIsConfigureTextOverlayChecked(!isConfigureTextOverlayChecked);
            }}
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
                      backgroundColor: `${
                        isShowBackgroundTextBoxChecked &&
                        hexToRGBA(
                          watchBackgroundBoxColor,
                          watchBackgroundBoxOpacity,
                        )
                      }`,
                      padding: `${isShowBackgroundTextBoxChecked && watchBackgroundBoxPadding}px`,
                    }}
                  >
                    <p
                      className={`${getFontClassName(
                        textOverlayFormStep?.font ?? Fonts.RobotoBlack,
                      )} left-5 right-20 z-50`}
                      style={{
                        fontSize: `${(textOverlayFormStep?.fontSize ?? 104) / 36}vw`,
                        color: watchFontColor,
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
                      {form.formState.errors?.text?.message}
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
                        if (value in Fonts) {
                          form.setValue("font", value as Fonts);
                          setTextOverlayFormStep((prev) => ({
                            ...prev,
                            font: value as Fonts,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger ref={field.ref} className="w-[180px]">
                        <SelectValue placeholder="Video preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Fonts).map((preset) => (
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

              <Controller
                control={form.control}
                shouldUnregister={true}
                name="fontColor"
                render={({ field }) => (
                  <div className="space-y-2">
                    <FormLabel ref={field.ref}>Font Color</FormLabel>
                    <HexColorPicker
                      color={field.value}
                      onChange={(newColor) => {
                        // Dont update the context here, because this is very inneficient for rapidly changing colors
                        field.onChange(newColor);
                      }}
                    />
                  </div>
                )}
              />
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
                  name="backgroundBoxSettings.backgroundBoxPadding"
                  render={({ field }) => (
                    <div className="z-[47] space-y-2">
                      <FormLabel>Background Box Padding</FormLabel>
                      <Select
                        name={field.name}
                        disabled={field.disabled}
                        onValueChange={(value) => {
                          const padAmount = parseInt(value, 10) ?? 10;
                          setTextOverlayFormStep((prev) => ({
                            ...prev,
                            backgroundBoxSettings: {
                              ...prev?.backgroundBoxSettings,
                              backgroundBoxPadding: padAmount,
                            },
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
                    name="backgroundBoxSettings.backgroundBoxOpacity"
                    control={form.control}
                    shouldUnregister={true}
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
                              textOverlaySettings: {
                                ...prev,
                                backgroundBoxSettings: {
                                  ...prev?.backgroundBoxSettings,
                                  backgroundBoxOpacity: value,
                                },
                              },
                            }));
                            field.onChange(value);
                          }}
                        />
                      </div>
                    )}
                  />
                </div>

                <Controller
                  control={form.control}
                  name="backgroundBoxSettings.backgroundBoxColor"
                  shouldUnregister={true}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <FormLabel ref={field.ref}>
                        Background Box Color
                      </FormLabel>
                      <HexColorPicker
                        color={field.value}
                        onChange={(newColor) => {
                          // Dont update the context here, because this is very inneficient for rapidly changing colors
                          field.onChange(newColor);
                        }}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}

        <CreateVideoFormActions
          disableFormSubmit={isConfigureTextOverlayChecked === false}
          beforeNextCallback={() => {
            // If the user has not checked the configure text overlay checkbox, we can skip this step and ignore the form
            if (!isConfigureTextOverlayChecked) {
              nextStep();
            }
          }}
        />
      </form>
    </Form>
  );
}
