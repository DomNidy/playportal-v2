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
    <div className="flex w-full justify-end gap-2 z-[50] dark">
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
          <Button size="sm" type="submit">
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </>
      )}
    </div>
  );
}
