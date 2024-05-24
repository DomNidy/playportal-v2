import { SignupForm } from "~/components/ui/AuthForms/SignupForm";
import SignupToMailingListInput from "~/components/ui/MailingList/SignupToMailingListInput";
import { env } from "~/env";

export default async function Page() {
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
          <SignupToMailingListInput />
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      {/* <SignUp /> */}
      <SignupForm />
    </div>
  );
}
