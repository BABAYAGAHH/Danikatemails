"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSafeClientRedirectPath } from "@/lib/utils/redirect";
import { signInSchema } from "@/lib/validators/auth";

type FormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const form = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl
      });

      if (!response || response.error) {
        throw new Error("Invalid email or password");
      }

      return response.url ?? callbackUrl;
    },
    onSuccess: (redirectUrl) => {
      toast.success("Welcome back");
      router.push(getSafeClientRedirectPath(redirectUrl, callbackUrl) as Route);
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
        <CardTitle className="text-3xl">Sign in</CardTitle>
        <CardDescription>
          Access your workspace, contacts, campaigns, and compliance controls.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input autoComplete="email" id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete="current-password"
              id="password"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          New to RegionReach?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href={"/sign-up" as Route}
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
