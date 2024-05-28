import { Link } from "~/components/ui/Link";

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
      <Link variant={"button"} href="/dashboard" className="py-3">
        Go back to the dashboard
      </Link>
    </div>
  );
}
