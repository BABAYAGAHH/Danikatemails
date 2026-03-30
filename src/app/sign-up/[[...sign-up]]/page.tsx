import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignUpForm } from "@/features/auth/sign-up-form";

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.96))] px-4 py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.98))]">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
              Native authentication
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
              Create a workspace built for compliant B2B outreach from day one.
            </h1>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              Sign up with email and password, create your workspace, and start managing public
              business contacts, templates, senders, and campaigns under one auditable system.
            </p>
            <div className="mt-10 grid gap-4 text-sm text-muted-foreground">
              <div className="panel px-5 py-4">Seed-ready demo flows backed by Neon PostgreSQL and Prisma.</div>
              <div className="panel px-5 py-4">Custom credentials auth with hashed passwords and protected app routes.</div>
              <div className="panel px-5 py-4">Campaign launch safety checks before any compliant send begins.</div>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <SignUpForm />
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Prefer the marketing page first?{" "}
              <Link className="font-medium text-foreground underline underline-offset-4" href="/">
                View RegionReach
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
