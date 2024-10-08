/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { HorizontalStep } from "./HorizontalStep";
import type { StepProps } from "./StepperTypes";
import { useStepper } from "./use-stepper";
import { VerticalStep } from "./VerticalStep";

// Props which shouldn't be passed to to the Step component from the user
interface StepInternalConfig {
  index: number;
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
}

interface FullStepProps extends StepProps, StepInternalConfig {}

const Step = React.forwardRef<HTMLLIElement, StepProps>(
  (props, ref: React.Ref<any>) => {
    const {
      children,
      description,
      icon,
      state,
      checkIcon,
      errorIcon,
      index,
      isCompletedStep,
      isCurrentStep,
      isLastStep,
      isKeepError,
      label,
      onClickStep,
    } = props as FullStepProps;

    const { isVertical, isError, isLoading, clickable } = useStepper();

    const hasVisited = isCurrentStep || isCompletedStep;

    const sharedProps = {
      isLastStep,
      isCompletedStep,
      isCurrentStep,
      index,
      isError,
      isLoading,
      clickable,
      label,
      description,
      hasVisited,
      icon,
      isKeepError,
      checkIcon,
      state,
      errorIcon,
      onClickStep,
    };

    // TODO: This likely causes the state to be dropped when we resize the window
    // TODO: Solution: Infer the state from context?
    const renderStep = () => {
      switch (isVertical) {
        case true:
          return (
            <VerticalStep ref={ref} {...sharedProps}>
              {children}
            </VerticalStep>
          );
        default:
          return <HorizontalStep ref={ref} {...sharedProps} />;
      }
    };

    return renderStep();
  },
);

Step.displayName = "Step";

export { Step };
