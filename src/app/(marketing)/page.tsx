import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MailCheck, ShieldCheck, Users2 } from "lucide-react";

const signInRoute = "/sign-in" as Route;
const signUpRoute = "/sign-up" as Route;

const features = [
  {
    title: "Compliance-first lead operations",
    description:
      "Track lawful basis, consent signals, sender identity, suppression, unsubscribe state, and audit logs in one workspace.",
    icon: ShieldCheck
  },
  {
    title: "Regional segmentation that stays usable",
    description:
      "Organize public business contacts by geography, industry, company size, and status without losing visibility into send safety.",
    icon: Users2
  },
  {
    title: "Campaigns with guardrails built in",
    description:
      "Launch only from verified senders, require postal address and unsubscribe copy, and automatically block unsafe recipients.",
    icon: MailCheck
  }
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex max-w-7xl flex-col px-6 py-8 lg:px-8">
        <header className="mb-20 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
              RegionReach
            </div>
            <div className="mt-2 text-lg font-semibold">Compliance-first B2B outreach</div>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-xl border border-border px-4 py-2 text-sm font-medium" href={signInRoute}>
              Sign in
            </Link>
            <Link className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href={signUpRoute}>
              Start free
            </Link>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <BadgeCheck className="h-4 w-4" />
              Purpose-built for lawful B2B outreach programs
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl font-semibold tracking-tight text-foreground lg:text-7xl">
                Discover, segment, and send with compliance controls from day one.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                RegionReach helps teams manage public company contacts, sender verification, suppression, unsubscribe handling, and regional campaign safety in one serious SaaS workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground" href={signUpRoute}>
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-6 py-3 text-sm font-semibold" href={signInRoute}>
                View dashboard
              </Link>
            </div>
          </div>

          <div className="panel overflow-hidden p-6">
            <div className="rounded-3xl border border-border/70 bg-slate-950 p-6 text-slate-50">
              <div className="text-sm text-slate-300">Launch checklist</div>
              <div className="mt-6 space-y-4">
                {[
                  "Sender identity verified",
                  "Workspace postal address present",
                  "Unsubscribe footer included",
                  "Suppressed contacts removed",
                  "Lawful basis enforced"
                ].map((item) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3" key={item}>
                    <BadgeCheck className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="panel p-6" key={feature.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </section>
      </section>
    </main>
  );
}
