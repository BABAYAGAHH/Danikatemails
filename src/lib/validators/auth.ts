import { z } from "zod";

export const authEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

export const authPasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Password must include uppercase, lowercase, and a number"
  );

export const signInSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, "Password is required").max(72)
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: authEmailSchema,
  password: authPasswordSchema,
  workspaceName: z
    .string()
    .trim()
    .max(120, "Workspace name must be 120 characters or fewer")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
