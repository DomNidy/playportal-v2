import { redirect } from "next/navigation";
import { SigninForm } from "~/components/ui/AuthForms";
import { SignupToMailingListForm } from "~/components/ui/MailingList";
import { env } from "~/env";
import { createClient } from "~/utils/supabase/server";

export default async function Page() {
  const supabase = createClient();

  // Check if the user is already logged in, if so, redirect them
  const {
    data: { user },
    error: supabaseAuthError,
  } = await supabase.auth.getUser();

  //* Since this layout is on the server-side, the user will not even end up on the dashboard route at all, they'll just be instantly redirected
  if (user?.id) {
    console.log("user in signin", user);
    return redirect("/dashboard");
  } else if (supabaseAuthError) {
    console.error(supabaseAuthError);
  }

  // Display waitlist signup if the signup page is disabled
  if (!env.NEXT_PUBLIC_PLAYPORTAL_DISPLAY_SIGNUP_PAGE) {
    return (
      <div>
        <div className="landing-bg-gradient pointer-events-none absolute top-0 h-[1450px] max-h-screen w-full " />
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
      <SigninForm />
    </div>
  );
}
