// This is an operation card that is displayed to prompt the user to create a new video

import Link from "next/link";

export function OperationCardDummy() {
  return (
    <Link
      href={"/dashboard/create-video"}
      className="group flex h-[5.5rem] w-[21rem] flex-row items-center gap-2 rounded-2xl border border-dashed  bg-colors-background-950 px-5 py-2 pt-4 hover:bg-white/20"
    >
      <p className="w-full cursor-pointer rounded-lg py-2 text-center text-sm text-white/80  group-hover:text-white">
        Click here to create a new video
      </p>
    </Link>
  );
}
