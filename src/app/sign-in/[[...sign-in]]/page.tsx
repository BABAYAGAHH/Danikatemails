import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="panel max-w-lg p-8">
          <h1 className="text-2xl font-semibold">Configure Clerk to enable sign in</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to your local environment before using RegionReach authentication flows.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignIn
        fallbackRedirectUrl="/dashboard"
        path="/sign-in"
        routing="path"
        signUpFallbackRedirectUrl="/sign-up"
      />
    </main>
  );
}
