import type { UserRole } from "@prisma/client";
import { isFixedAdminEmail } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export interface AdminUserListItem {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  role: UserRole;
  isFixedAdmin: boolean;
}

export interface AdminUsersPayload {
  total: number;
  users: AdminUserListItem[];
}

interface UserRow {
  id: string;
  displayName: string;
  email: string;
  createdAt: Date;
  role: UserRole;
}

export function serializeAdminUser(user: UserRow): AdminUserListItem {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    role: user.role,
    isFixedAdmin: isFixedAdminEmail(user.email),
  };
}

export async function getAdminUsersPayload(): Promise<AdminUsersPayload> {
  const [total, users] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        createdAt: true,
        role: true,
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    total,
    users: users.map(serializeAdminUser),
  };
}
