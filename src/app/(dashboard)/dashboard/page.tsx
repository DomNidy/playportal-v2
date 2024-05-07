import Link from "next/link";
import RecentOperationsDisplay from "~/components/ui/RecentOperationsDisplay";

export default function Dashboard() {
  // Query for recent operations

  return (
    <div className="mt-10 flex flex-col items-center">
      <div className="flex w-full flex-row-reverse">
        <Link
          href={"/dashboard/create-video"}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary p-2 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Create Video...
        </Link>
      </div>
      <RecentOperationsDisplay />
    </div>
  );
}
