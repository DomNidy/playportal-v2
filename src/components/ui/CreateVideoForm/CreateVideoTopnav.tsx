import { Link } from "~/components/ui/Link";
import React from "react";
import PlayportalIcon from "../../../../public/playportal.svg";
import { UserButton } from "../UserButton";
import Image from "next/image";
import { createClient } from "~/utils/supabase/server";

export default async function CreateVideoTopnav() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("user_data")
    .select("*")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="sticky bottom-24 left-24 top-0 z-[46] w-full overflow-x-clip">
      <div className="absolute -top-32 h-80 w-full flex-col items-center justify-center   bg-neutral-950 px-4 pb-0 md:px-6 ">
        <div className="mt-4  flex h-12 w-full flex-row justify-between font-semibold tracking-tight">
          <div className="flex flex-row items-center justify-center gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <Image priority src={PlayportalIcon} alt="" />
            <Link href="/dashboard">Playportal</Link>
          </div>
          <div className="top-0 flex flex-row items-start justify-center gap-4">
            <UserButton user={userData} />
          </div>
        </div>
        <div className="flex w-full flex-col items-center">
          <div className="mt-4 flex w-full max-w-[1018px] flex-col items-start self-center ">
            <h2 className="text-4xl font-bold tracking-tight">
              Create a Video
            </h2>
            <h3 className="text-xl font-semibold tracking-tight text-muted-foreground">
              Throw in some audio and an image.
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
