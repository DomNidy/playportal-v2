import { MoonLoader } from "react-spinners";
import { type LoaderSizeProps } from "react-spinners/helpers/props";

export default function SubmitStatus({
  isLoading,
  text,
  loaderProps,
}: {
  isLoading: boolean;
  text: string;
  loaderProps: LoaderSizeProps;
}) {
  return isLoading ? (
    <span className="flex flex-row items-center justify-center gap-2">
      <p>{text}</p>
      <MoonLoader {...loaderProps} />
    </span>
  ) : (
    <p>{text}</p>
  );
}
