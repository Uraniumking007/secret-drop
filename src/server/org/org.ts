import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { orgs } from "drizzle/schema";

export const createOrg = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { name: data.get("name")?.toString() || "" };
  })
  .handler(async (ctx: any) => {
    const { data, request } = ctx as {
      data: { name: string };
      request: Request;
    };

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) throw new Error("User not authenticated");
    const ownerId = session?.user?.id as string;

    const inserted = await db
      .insert(orgs)
      .values({ name: data.name, ownerId } as typeof orgs.$inferInsert)
      .returning({ id: orgs.id });

    return { success: true, id: inserted[0]?.id };
  });
