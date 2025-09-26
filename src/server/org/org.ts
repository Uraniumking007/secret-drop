import { orgs, orgTeams, teamMembers, teams, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { asc, eq, and, count, sql, inArray } from "drizzle-orm";

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

// Helper function to get authenticated user ID
async function getAuthenticatedUserId(): Promise<string> {
  const headers = new Headers();
  const cookie = getRequestHeader("cookie");
  if (cookie) headers.set("cookie", cookie);
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("User not authenticated");
  return session.user.id as string;
}

// Helper function to get org IDs where user is owner
async function getOwnedOrgIds(userId: string): Promise<string[]> {
  const ownedOrgs = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.ownerId, userId));

  return ownedOrgs.map((o) => o.id);
}

// Helper function to get org IDs where user is a member via teams
async function getMemberOrgIds(userId: string): Promise<string[]> {
  const memberOrgs = await db
    .select({ orgId: orgs.id })
    .from(orgs)
    .innerJoin(orgTeams, eq(orgs.id, orgTeams.orgId))
    .innerJoin(teams, eq(orgTeams.teamId, teams.id))
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId));

  return memberOrgs.map((m) => m.orgId);
}

// Helper function to get all unique org IDs for a user
async function getAllUserOrgIds(userId: string): Promise<string[]> {
  const [ownedIds, memberIds] = await Promise.all([
    getOwnedOrgIds(userId),
    getMemberOrgIds(userId),
  ]);

  return Array.from(new Set([...ownedIds, ...memberIds]));
}

// Helper function to get org details
async function getOrgDetails(orgIds: string[]) {
  return await db
    .select()
    .from(orgs)
    .where(inArray(orgs.id, orgIds))
    .orderBy(asc(orgs.createdAt));
}

// Helper function to get team counts for orgs
async function getTeamCounts(
  orgIds: string[]
): Promise<Record<string, number>> {
  const teamCounts = await db
    .select({
      orgId: orgTeams.orgId,
      count: count(),
    })
    .from(orgTeams)
    .where(inArray(orgTeams.orgId, orgIds))
    .groupBy(orgTeams.orgId);

  return teamCounts.reduce(
    (acc, row) => {
      acc[row.orgId] = row.count;
      return acc;
    },
    {} as Record<string, number>
  );
}

// Helper function to get user counts for orgs
async function getUserCounts(
  orgIds: string[]
): Promise<Record<string, number>> {
  const userCounts = await db
    .select({
      orgId: orgTeams.orgId,
      count: sql<number>`COUNT(DISTINCT ${teamMembers.userId})`,
    })
    .from(orgTeams)
    .innerJoin(teams, eq(orgTeams.teamId, teams.id))
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(inArray(orgTeams.orgId, orgIds))
    .groupBy(orgTeams.orgId);

  return userCounts.reduce(
    (acc, row) => {
      acc[row.orgId] = row.count;
      return acc;
    },
    {} as Record<string, number>
  );
}

// Helper function to get org details with counts
async function getOrgDetailsWithCounts(orgIds: string[]) {
  const [organizations, teamCounts, userCounts] = await Promise.all([
    getOrgDetails(orgIds),
    getTeamCounts(orgIds),
    getUserCounts(orgIds),
  ]);

  return organizations.map((org) => ({
    ...org,
    teamCount: teamCounts[org.id] || 0,
    userCount: userCounts[org.id] || 0,
  }));
}

// Helper function to add role information to orgs
function addRoleToOrgs(organizations: any[], userId: string) {
  return organizations.map((org) => ({
    ...org,
    role: org.ownerId === userId ? "owner" : "member",
  }));
}

export const getUserOrgs = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthenticatedUserId();
    const allOrgIds = await getAllUserOrgIds(userId);

    if (allOrgIds.length === 0) {
      return { organizations: [] };
    }

    const organizations = await getOrgDetailsWithCounts(allOrgIds);
    const result = addRoleToOrgs(organizations, userId);

    return { organizations: result };
  }
);
