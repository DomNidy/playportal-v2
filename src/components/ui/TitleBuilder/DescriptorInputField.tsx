import React from "react";
import { Input } from "../Input";
import { Button } from "../Button";

export type DescriptorInputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    // Function which removes this descriptor from the list
    removeDescriptor: () => void;
    // The index of this descriptor in the list of descriptors state
    descriptorIndex: number;
  };

const DescriptorInputField = React.forwardRef<
  HTMLInputElement,
  DescriptorInputProps
>(({ type, descriptorIndex, removeDescriptor, ...props }, ref) => {
  return (
    <div className="flex flex-row gap-2">
      <Input type={type} ref={ref} {...props} className="flex-1" />

      {descriptorIndex !== 0 && (
        <Button onClick={() => removeDescriptor()} type="button">
          Remove
        </Button>
      )}
    </div>
  );
});

DescriptorInputField.displayName = "DescriptorInputField";

export default DescriptorInputField;
