import { orgs, teamMembers, teams } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { asc, eq, inArray } from "drizzle-orm";

export const createOrg = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { name: data.get("name")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    // Use getRequestHeader per TanStack Start server functions to access headers
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) throw new Error("User not authenticated");
    const ownerId = session.user.id as string;

    const inserted = await db
      .insert(orgs)
      .values({ name: data.name, ownerId } as typeof orgs.$inferInsert)
      .returning({ id: orgs.id });

    return { success: true, id: inserted[0]?.id };
  });

export const getOrgById = createServerFn({ method: "GET" })
  .validator((data) => {
    // Expect plain object input per server function docs
    if (!data || typeof (data as any).id !== "string") {
      throw new Error("Expected { id: string }");
    }
    return { id: (data as any).id as string };
  })
  .handler(async ({ data }) => {
    const org = await db.select().from(orgs).where(eq(orgs.id, data.id));
    return { org: org[0] };
  });

export const getUserOrgs = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) throw new Error("User not authenticated");
    const userId = session.user.id as string;
    let organizations = await db
      .select()
      .from(orgs)
      .where(eq(orgs.ownerId, userId))
      .orderBy(asc(orgs.createdAt));
    // Get organizations where the user is a member (not just owner)
    const userAffiliations = await db
      .select({ orgId: teams.orgId })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));

    const memberOrgIds = Array.from(
      new Set(
        userAffiliations
          .map((r) => r.orgId)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (memberOrgIds.length > 0) {
      const memberOrgs = await db
        .select()
        .from(orgs)
        .where(inArray(orgs.id, memberOrgIds));
      // Merge and de-duplicate
      const merged = new Map(organizations.map((o) => [o.id, o]));
      for (const o of memberOrgs) merged.set(o.id, o);
      organizations = Array.from(merged.values()).sort((a, b) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
      );
    }
    return { organizations };
  }
);
