import React from "react";
import { useStepper } from "../Stepper";
import { Button } from "../Button";
import { useCreateVideoForm } from "./CreateVideoFormContext";

export default function CreateVideoFormActions({
  // Callback executed before the previous step is shown, useful for cleanup
  beforePreviousCallback,
  // Callback executed before the next step is shown
  beforeNextCallback,
}: {
  beforePreviousCallback?: () => void;
  beforeNextCallback?: () => void;
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
              type="submit"
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
