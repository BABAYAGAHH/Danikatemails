import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

function assertClerkConfigured() {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error(
      "Clerk authentication is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY."
    );
  }
}

export async function requireUser() {
  assertClerkConfigured();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerkUser = await currentUser();

  if (!clerkUser?.primaryEmailAddress?.emailAddress) {
    throw new Error("Authenticated user is missing a primary email address");
  }

  const user = await prisma.user.upsert({
    where: {
      id: userId
    },
    create: {
      id: userId,
      email: clerkUser.primaryEmailAddress.emailAddress,
      name: clerkUser.fullName ?? clerkUser.firstName ?? clerkUser.username,
      image: clerkUser.imageUrl
    },
    update: {
      email: clerkUser.primaryEmailAddress.emailAddress,
      name: clerkUser.fullName ?? clerkUser.firstName ?? clerkUser.username,
      image: clerkUser.imageUrl
    }
  });

  return user;
}
