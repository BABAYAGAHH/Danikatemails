import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/utils/http";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function buildUniqueWorkspaceSlug(name: string) {
  const baseSlug = slugify(name) || "workspace";
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.workspace.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function buildDefaultWorkspaceName(name: string, email: string) {
  const trimmedName = name.trim();
  if (trimmedName.length > 0) {
    return `${trimmedName.split(" ")[0]}'s Workspace`;
  }

  return `${email.split("@")[0]} workspace`;
}

export class AuthService {
  static async authorize(credentials: unknown) {
    const parsed = signInSchema.safeParse(credentials);

    if (!parsed.success) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsed.data.email
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        passwordHash: true
      }
    });

    if (!user?.passwordHash) {
      return null;
    }

    const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
    return matches ? user : null;
  }

  static async register(payload: unknown) {
    const data = signUpSchema.parse(payload);

    const existing = await prisma.user.findUnique({
      where: {
        email: data.email
      },
      select: {
        id: true
      }
    });

    if (existing) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const workspaceName = data.workspaceName ?? buildDefaultWorkspaceName(data.name, data.email);
    const workspaceSlug = await buildUniqueWorkspaceSlug(workspaceName);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash
        }
      });

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: workspaceSlug,
          members: {
            create: {
              userId: user.id,
              role: UserRole.OWNER
            }
          }
        }
      });

      await tx.auditLog.createMany({
        data: [
          {
            workspaceId: workspace.id,
            actorUserId: user.id,
            action: "auth.signup",
            entityType: "user",
            entityId: user.id,
            metadata: {
              email: user.email
            }
          },
          {
            workspaceId: workspace.id,
            actorUserId: user.id,
            action: "workspace.created",
            entityType: "workspace",
            entityId: workspace.id,
            metadata: {
              slug: workspace.slug,
              source: "signup"
            }
          }
        ]
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        },
        workspace
      };
    });
  }

  static async getPrimaryWorkspaceId(userId: string) {
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId
      },
      orderBy: {
        createdAt: "asc"
      },
      select: {
        workspaceId: true
      }
    });

    return membership?.workspaceId ?? null;
  }
}
