import { CirclePlus } from "lucide-react";
import { Link } from "~/components/ui/Link";
import RecentOperationsDisplay from "~/components/ui/RecentOperationsDisplay";

export default function Dashboard() {
  return (
    <div className="mt-10 flex flex-col items-center p-4">
      <div className="flex w-full flex-row-reverse">
        <Link
          href={"/dashboard/create-video"}
          variant={"button"}
          className="gap-1"
        >
          <CirclePlus strokeWidth={1.4} height={20} width={20} /> Create Video
        </Link>
      </div>
      <RecentOperationsDisplay />
    </div>
  );
}
