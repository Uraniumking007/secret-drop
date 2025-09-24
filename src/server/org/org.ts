import { orgs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

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

    console.log("ownerId", ownerId);
    console.log("data", data);
    console.log("name", data.name);

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
