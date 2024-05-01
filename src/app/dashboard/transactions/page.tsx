import { redirect } from "next/navigation";
import { columns } from "~/components/ui/TransactionsTable/columns";
import { DataTable } from "~/components/ui/TransactionsTable/data-table";
import { createClient } from "~/utils/supabase/server";

export default async function TransactionsPage() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <DataTable columns={columns} data={data ?? []} />;
}
