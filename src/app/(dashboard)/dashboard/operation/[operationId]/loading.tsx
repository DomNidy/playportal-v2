import { ScaleLoader } from "react-spinners";

export default function LoadingPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ScaleLoader color="white" />
    </div>
  );
}
