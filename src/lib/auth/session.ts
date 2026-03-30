import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/utils/http";

export async function getSession() {
  return auth();
}

export async function getOptionalUser() {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function requireUser() {
  const user = await getOptionalUser();

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return user;
}
