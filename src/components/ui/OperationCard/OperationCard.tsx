import { DownloadIcon } from "lucide-react";

export default function OperationCard() {
  return (
    <div className="flex h-[5.5rem] w-80 flex-row gap-2 rounded-2xl  border-[1px] bg-black px-5 py-2 pt-4">
      <div className="flex flex-col">
        <h1 className="text-base font-medium ">My video</h1>
        <p className="mt-[0.2rem] text-sm text-white/80">
          Created on 5/4/2024 @ 1:30PM
        </p>
      </div>
      <DownloadIcon className="ml-auto cursor-pointer p-[1.55px] hover:rounded-lg hover:bg-white/20" />
    </div>
  );
}
