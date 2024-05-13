import {
  Controller,
  ControllerRenderProps,
  useFormContext,
} from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { type ChangeEvent, type ChangeEventHandler, type FC } from "react";

export const DropzoneField: FC<{
  name: string;
  multiple?: boolean;
  onFileChanged: (e: ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, multiple, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field: { onChange, name, value } }) => (
        <Dropzone
          multiple={multiple}
          onChange={(e) => {
            console.log("Changed");
            onChange(multiple ? e.target.files : e.target.files?.[0] ?? null);
          }}
          {...rest}
        />
      )}
      name={name}
      control={control}
      defaultValue=""
    />
  );
};

export const Dropzone: FC<{
  multiple?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  controllerRenderProps: ControllerRenderProps<T><T,>;
}> = ({ multiple, onChange, ...rest }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    accept: {
      "audio/*": [".mp3", ".wav"],
    },
    ...rest,
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-lg bg-[#0C0B0C] ${isDragActive ? "bg-[#0C0B0C]/50" : ""}`}
    >
      <input
        {...getInputProps({ onChange })}
        onChange={() => console.log("ch")}
      />
      Dropped
    </div>
  );
};
