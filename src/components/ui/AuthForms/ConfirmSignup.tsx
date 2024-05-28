import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card/Card";

export default function ConfirmSignupScreen({
  confirmationUrl,
}: {
  confirmationUrl: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-none bg-white p-4 shadow-input dark:bg-black md:rounded-2xl md:p-8">
      <Card>
        <CardHeader>
          <CardTitle> Let{"'"}s get started</CardTitle>
          <CardDescription>
            Thanks for signing up! To complete the process, hit the button below
            and get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We don't want this link to prefetch as it will automatically confirm signup if it does */}
          <a
            href={confirmationUrl}
            className="inline-flex h-fit items-center justify-center self-center whitespace-nowrap rounded-md bg-primary-foreground  bg-white px-3 py-3 text-sm font-medium text-black ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Confirm Signup
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
