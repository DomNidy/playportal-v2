import { Link } from "~/components/ui/Link";
import RecentOperationsDisplay from "~/components/ui/RecentOperationsDisplay";

export default function Dashboard() {
  return (
    <div className="mt-10 flex flex-col items-center px-4">
      <div className="flex w-full flex-row-reverse">
        <Link href={"/dashboard/create-video"} variant={"button"}>
          Create Video...
        </Link>
      </div>
      <RecentOperationsDisplay />
    </div>
  );
}
