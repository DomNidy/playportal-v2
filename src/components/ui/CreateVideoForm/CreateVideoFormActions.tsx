import React from "react";
import { useStepper } from "../Stepper";
import { Button } from "../Button";
import { useCreateVideoForm } from "./CreateVideoFormContext";

export default function CreateVideoFormActions({
  // Callback executed before the previous step is shown, useful for cleanup
  beforePreviousCallback,
  // Callback executed before the next step is shown
  beforeNextCallback,
  // If set to true, we will use a type="button" for the submit button instead of type="submit"
  // Useful if there is an optional form step
  disableFormSubmit = false,
}: {
  beforePreviousCallback?: () => void;
  beforeNextCallback?: () => void;
  disableFormSubmit?: boolean;
}) {
  const {
    prevStep,
    resetSteps,
    isDisabledStep,
    hasCompletedAllSteps,
    isLastStep,
  } = useStepper();

  const { isUploadingFiles } = useCreateVideoForm();

  return (
    <div className="dark z-[50] mt-2 flex w-full justify-end gap-2">
      {hasCompletedAllSteps ? (
        <Button size="sm" type="button" onClick={resetSteps}>
          Reset
        </Button>
      ) : (
        <>
          <Button
            disabled={isDisabledStep || isUploadingFiles}
            onClick={() => {
              beforePreviousCallback?.();
              prevStep();
            }}
            size="sm"
            variant="secondary"
            type="button"
          >
            Prev
          </Button>
          {!isLastStep && (
            <Button
              size="sm"
              type={disableFormSubmit ? "button" : "submit"}
              onClick={() => {
                beforeNextCallback?.();
              }}
            >
              Next
            </Button>
          )}
        </>
      )}
    </div>
  );
}
