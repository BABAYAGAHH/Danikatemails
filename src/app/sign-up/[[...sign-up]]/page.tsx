import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="panel max-w-lg p-8">
          <h1 className="text-2xl font-semibold">Configure Clerk to enable sign up</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to your local environment before using RegionReach authentication flows.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignUp
        fallbackRedirectUrl="/onboarding"
        path="/sign-up"
        routing="path"
        signInFallbackRedirectUrl="/sign-in"
      />
    </main>
  );
}
