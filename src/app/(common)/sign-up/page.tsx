import { redirect } from "next/navigation";
import { SignupForm } from "~/components/ui/AuthForms";
import { SignupToMailingListForm } from "~/components/ui/MailingList";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/server";

export default async function Page() {
  const supabase = createClient();

  // Check if the user is already logged in, if so, redirect them
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //* Since this layout is on the server-side, the user will not even end up on the dashboard route at all, they'll just be instantly redirected
  if (user?.id) return redirect("/dashboard");

  // Display waitlist signup if the signup page is disabled
  if (!env.NEXT_PUBLIC_PLAYPORTAL_DISPLAY_SIGNUP_PAGE) {
    return (
      <div>
        <div className="pointer-events-none absolute top-0 h-[1450px] max-h-screen w-full " />
        <div className="dark mx-auto flex h-screen max-h-screen w-full max-w-[600px]  -translate-y-24  flex-col justify-center overflow-clip px-4 ">
          <h2 className="text-3xl font-semibold">
            We{"'re"} not ready yet, but we{"'re"} cooking.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email address, and we{"'"}ll let you know when we launch.
            Perhaps we{"'"}ll even send you something special (other than
            marketing emails, of course!)
          </p>
          <SignupToMailingListForm />
        </div>
      </div>
    );
  }

  return (
    <div
      className="dark flex items-center "
      style={{
        height: "calc(100vh - 126px)",
      }}
    >
      <div className="pointer-events-none absolute top-0 h-[1450px] max-h-screen w-full " />
      <div className="w-full px-2">
        {/* <SignUp /> */}
        <SignupForm />
      </div>
    </div>
  );
}
