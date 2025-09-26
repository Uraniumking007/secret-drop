import { orgs, orgTeams, teamMembers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { eq, or } from "drizzle-orm";

export const getUserRoleInOrg = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) throw new Error("User not authenticated");
    const userId = session.user.id as string;
    const userRole = await db
      .select()
      .from(orgs)
      .leftJoin(orgTeams, eq(orgs.id, orgTeams.orgId))
      .leftJoin(teamMembers, eq(orgTeams.teamId, teamMembers.teamId))
      .where(or(eq(orgs.ownerId, userId), eq(teamMembers.userId, userId)));

    if (userRole.length === 0) {
      return "Member";
    }

    return userRole[0].orgs.ownerId === userId
      ? "Owner"
      : userRole[0].team_members?.role;
  }
);
