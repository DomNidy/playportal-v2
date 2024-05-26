import Link from "next/link";

export default async function OperationPage() {
  // The user should not be here without an opertionId in their params, redirect them with toast
  return (
    <div
      style={{
        height: "calc(100vh - 266px)",
      }}
      className="flex max-w-[800px] flex-col items-center justify-center"
    >
      <h2 className="text-3xl font-semibold">
        Sorry, we couldn{"'t"} find what you were looking for
      </h2>
      <p className="mb-12">Please go back to the dashboard and try again.</p>
      <Link
        className="inline-flex h-fit items-center justify-center self-center whitespace-nowrap rounded-md bg-primary-foreground  bg-white px-3 py-3 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        href="/dashboard"
      >
        Go back to the dashboard
      </Link>
    </div>
  );
}
