/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import * as React from "react";

import { Button } from "~/components/ui/Button";
import { cn } from "~/utils/utils";
import type { StepSharedProps } from "./StepperTypes";
import { useStepper } from "./use-stepper";

type StepButtonContainerProps = StepSharedProps & {
  children?: React.ReactNode;
};

const StepButtonContainer = ({
  isCurrentStep,
  isCompletedStep,
  children,
  isError,
  isLoading: isLoadingProp,
  onClickStep,
}: StepButtonContainerProps) => {
  const {
    clickable,
    isLoading: isLoadingContext,
    variant,
    styles,
  } = useStepper();

  const currentStepClickable = clickable || !!onClickStep;

  const isLoading = isLoadingProp || isLoadingContext;

  if (variant === "line") {
    return null;
  }

  return (
    <Button
      variant="ghost"
      type="button"
      tabIndex={currentStepClickable ? 0 : -1}
      className={cn(
        "stepper__step-button-container",
        "pointer-events-none rounded-full p-0",
        "h-[var(--step-icon-size)] w-[var(--step-icon-size)]",
        "flex items-center justify-center rounded-full border-2",
        "data-[clickable=true]:pointer-events-auto",
        "data-[active=true]:border-primary data-[active=true]:bg-black data-[active=true]:text-primary-foreground",
        "data-[current=true]:border-primary data-[current=true]:bg-black",
        "data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive data-[invalid=true]:text-destructive-foreground",
        styles?.["step-button-container"],
      )}
      aria-current={isCurrentStep ? "step" : undefined}
      data-current={isCurrentStep}
      data-invalid={isError && (isCurrentStep || isCompletedStep)}
      data-active={isCompletedStep}
      data-clickable={currentStepClickable}
      data-loading={isLoading && (isCurrentStep || isCompletedStep)}
    >
      {children}
    </Button>
  );
};

export { StepButtonContainer };
