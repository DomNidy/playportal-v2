import { useRouter } from "next/navigation";
import { useState } from "react";

type MultistepFormProps = {
  steps: React.ReactNode[];
  // Redirect the user to this url after they hit the "Back" button on the first page
  returnToUrlOnFormExit?: string;
};

export default function useMultistepForm({ ...props }: MultistepFormProps) {
  const [index, setIndex] = useState<number>(0);
  const router = useRouter();

  return {
    currentStep: props.steps[index],
    hasNext: index + 1 < props.steps.length,
    increment: () => {
      if (index + 1 < props.steps.length) setIndex((index) => index + 1);
    },
    decrement: () => {
      if (index - 1 >= 0) setIndex((index) => index - 1);
      if (index === 0 && props.returnToUrlOnFormExit)
        router.push(props.returnToUrlOnFormExit);
    },
  };
}
