import React from "react";
import { useStepper } from "../Stepper";
import { Button } from "../Button";

export default function CreateVideoFormActions() {
  const {
    prevStep,
    resetSteps,
    isDisabledStep,
    hasCompletedAllSteps,
    isLastStep,
  } = useStepper();

  return (
    <div className="dark z-[50] mt-2 flex w-full justify-end gap-2">
      {hasCompletedAllSteps ? (
        <Button size="sm" type="button" onClick={resetSteps}>
          Reset
        </Button>
      ) : (
        <>
          <Button
            disabled={isDisabledStep}
            onClick={prevStep}
            size="sm"
            variant="secondary"
            type="button"
          >
            Prev
          </Button>
          {!isLastStep && (
            <Button size="sm" type="submit">
              Next
            </Button>
          )}
        </>
      )}
    </div>
  );
}
