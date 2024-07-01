import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { TitleBuilderFormSchema } from "~/definitions/form-schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../Form";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import DescriptorInputField from "./DescriptorInputField";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Label } from "../Label";
import { Input } from "../Input";

interface TitleBuilderFormProps {
  setTitleCallback: (newTitle: string, beatName: string) => void;
  defaultBeatName?: string;
}

function getDescriptorPlaceholder(index: number): string {
  switch (index) {
    case 0:
      return "Drake";
    case 1:
      return "Dark";
    case 2:
      return "Melodic";
    default:
      return `Descriptor ${index + 1}`;
  }
}

function joinDescriptors(descriptors: string[]): string {
  return descriptors
    .map((descriptor) => {
      if (descriptor && descriptor?.length > 0) {
        return descriptor;
      }
    })
    .filter((descriptor) => descriptor !== undefined)
    .join(" x ");
}

function getAvailabilityString(
  availability: z.infer<typeof TitleBuilderFormSchema.shape.beatAvailability>,
): string {
  switch (availability) {
    case "Free":
      return "(FREE)";
    case "FreeForProfit":
      return "(FREE FOR PROFIT)";
    case "NoLabel":
      return "";
    default:
      return "";
  }
}

export function TitleBuilderForm({ ...props }: TitleBuilderFormProps) {
  const { setTitleCallback, defaultBeatName } = props;

  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>(
    getAvailabilityString("Free"),
  );
  const [beatName, setBeatName] = useState<string>(defaultBeatName ?? "");

  const form = useForm<z.infer<typeof TitleBuilderFormSchema>>({
    resolver: zodResolver(TitleBuilderFormSchema),
    defaultValues: {
      beatDescriptors: [""],
      beatAvailability: "Free",
      title: "",
      beatName: beatName ?? defaultBeatName ?? "",
    },
  });

  useEffect(() => {
    const title =
      `${selectedAvailability} ${joinDescriptors(selectedDescriptors)} Type Beat - "${beatName}"`.trimStart();
    form.setValue("title", title);
  }, [form, selectedAvailability, selectedDescriptors, beatName]);

  // Watch for changes to form fields and update react state accordingly
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      switch (name) {
        case "beatDescriptors":
          if (!value.beatDescriptors) {
            return;
          }

          // Use type guard to filter out undefined values
          const filteredDescriptors = value.beatDescriptors.filter(
            (descriptor): descriptor is string => descriptor !== undefined,
          );

          setSelectedDescriptors(filteredDescriptors);

          break;
        case "beatAvailability":
          console.log(value.beatAvailability);

          if (value.beatAvailability === undefined) {
            return;
          }

          setSelectedAvailability(
            getAvailabilityString(value.beatAvailability),
          );
          break;
        case "beatName":
          setBeatName(value.beatName ?? "");
          break;
      }
    });

    return () => subscription.unsubscribe();
  });

  const onSubmit = () => {
    setTitleCallback(form.getValues("title"), form.getValues("beatName"));
  };

  // The problem is, when we update an input field, the setter function converts it to a string and replaces the string array that we have
  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          // This is here to prevent this form from submitting the upload options form
          // These are displayed on the same screen, and this submit event propagates to the parent form
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit(onSubmit)();
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="beatName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beat Name</FormLabel>
              <FormDescription>What should we call this beat?</FormDescription>
              <FormControl>
                <Input placeholder="Rogue" {...field} />
              </FormControl>
              <FormMessage>
                {" "}
                {form.formState.errors.beatName?.message}{" "}
              </FormMessage>
            </FormItem>
          )}
        />

        <div className="mb-2 gap-1">
          <FormLabel>Beat Descriptors</FormLabel>
          <FormDescription>What kind of beat is this?</FormDescription>
        </div>
        <FormField
          shouldUnregister
          control={form.control}
          name="beatDescriptors"
          render={({ field }) => {
            return (
              <div className="flex flex-col gap-4">
                {form.getValues("beatDescriptors")?.map((_, index) => (
                  <DescriptorInputField
                    key={index}
                    {...field}
                    descriptorIndex={index}
                    placeholder={getDescriptorPlaceholder(index)}
                    onChange={(event) => {
                      const previousDescriptors =
                        form.getValues("beatDescriptors") ?? [];

                      previousDescriptors[index] = event.target.value;

                      form.setValue("beatDescriptors", previousDescriptors);
                    }}
                    value={form.getValues("beatDescriptors")[index] ?? ""}
                    removeDescriptor={() => {
                      form.setValue(
                        "beatDescriptors",
                        form
                          .getValues("beatDescriptors")
                          ?.filter((_, i) => i !== index),
                      );
                    }}
                    type="text"
                  />
                ))}
                <Button
                  type="button"
                  disabled={form.getValues("beatDescriptors")?.length >= 3}
                  onClick={() => {
                    form.setValue(
                      "beatDescriptors",
                      form.getValues("beatDescriptors")?.concat(""),
                    );
                  }}
                >
                  Add Descriptor
                </Button>
                <FormMessage>
                  {form.formState.errors.beatDescriptors?.message}
                </FormMessage>
              </div>
            );
          }}
        />

        <div className="mb-2 gap-1">
          <FormLabel>Beat Pricing</FormLabel>
          <FormDescription>
            Should we label this beat as free, free for profit, or no label?
          </FormDescription>
        </div>
        <FormField
          control={form.control}
          name="beatAvailability"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <RadioGroup
                defaultValue={field.value}
                onValueChange={field.onChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Free" id="r1">
                    Free
                  </RadioGroupItem>
                  <Label htmlFor="r1">Free</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FreeForProfit" id="r2">
                    Free For Profit
                  </RadioGroupItem>
                  <Label htmlFor="r2">Free For Profit</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NoLabel" id="r3">
                    No Label
                  </RadioGroupItem>
                  <Label htmlFor="r3">No Label</Label>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        />

        <div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title Preview</FormLabel>
                <FormControl>
                  <Input placeholder="Video title here" {...field} />
                </FormControl>
                <FormDescription>
                  This is the title you{"'ve"} created. Does it look good? You
                  can manually edit it here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Accept Title</Button>
      </form>
    </Form>
  );
}
