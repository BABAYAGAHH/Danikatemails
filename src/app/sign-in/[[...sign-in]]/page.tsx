import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInForm } from "@/features/auth/sign-in-form";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.96))] px-4 py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.18),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.98))]">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Compliance-first outreach
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
              Launch regional B2B campaigns without losing the audit trail.
            </h1>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              RegionReach keeps public business contacts, lawful basis tracking, suppression controls,
              sender verification, and campaign safety in one serious workspace.
            </p>
            <div className="mt-10 grid gap-4 text-sm text-muted-foreground">
              <div className="panel px-5 py-4">Only public business contact intake and compliant campaign flows.</div>
              <div className="panel px-5 py-4">Automatic eligibility checks before recipients ever enter the queue.</div>
              <div className="panel px-5 py-4">Suppression, unsubscribe, complaint, and audit history built in.</div>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <SignInForm />
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Need the landing page first?{" "}
              <Link className="font-medium text-foreground underline underline-offset-4" href="/">
                Go back home
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
