import { MoonLoader } from "react-spinners";
import { type LoaderSizeProps } from "react-spinners/helpers/props";

export default function SubmitStatus({
  isLoading,
  text,
  loaderProps,
}: {
  isLoading: boolean;
  text: string;
  loaderProps?: LoaderSizeProps;
}) {
  const _loaderProps = loaderProps ?? {
    size: 20,
  };

  return isLoading ? (
    <span className="flex flex-row items-center justify-center gap-2">
      <p>{text}</p>
      <MoonLoader {..._loaderProps} />
    </span>
  ) : (
    <p>{text}</p>
  );
}
