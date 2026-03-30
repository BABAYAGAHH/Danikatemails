"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSafeClientRedirectPath } from "@/lib/utils/redirect";
import { signUpSchema } from "@/lib/validators/auth";

type FormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      workspaceName: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create account");
      }

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (!signInResult || signInResult.error) {
        throw new Error("Account created, but automatic sign in failed");
      }

      return signInResult.url ?? "/dashboard";
    },
    onSuccess: (redirectUrl) => {
      toast.success("Account created");
      router.push(getSafeClientRedirectPath(redirectUrl, "/dashboard") as Route);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <Card className="w-full max-w-md border-border/70 bg-background/95 shadow-2xl shadow-black/5">
      <CardHeader>
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">RegionReach</div>
        <CardTitle className="text-3xl">Create account</CardTitle>
        <CardDescription>
          Start a compliance-first outreach workspace with native email and password access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input autoComplete="name" id="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input autoComplete="email" id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input autoComplete="new-password" id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workspaceName">Workspace name</Label>
            <Input
              id="workspaceName"
              placeholder="Optional. We can create one automatically."
              {...form.register("workspaceName")}
            />
            {form.formState.errors.workspaceName ? (
              <p className="text-sm text-destructive">{form.formState.errors.workspaceName.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href={"/sign-in" as Route}
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
