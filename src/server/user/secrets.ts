import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/db";
import { environment, secretView } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getRequestHeader } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { customAlphabet } from "nanoid";

// Helper functions to convert form data to boolean and date
const toBool = (v: unknown) =>
  typeof v === "string" ? v === "true" : Boolean(v);
const toDate = (v: unknown) => (v ? new Date(String(v)) : null);

// Helper function to get authenticated user ID
const getAuthenticatedUserId = async () => {
  const headers = new Headers();
  const cookie = getRequestHeader("cookie");
  if (cookie) headers.set("cookie", cookie);
  const session = await auth.api.getSession({ headers });
  return session.user.id as string;
};

// Generate a unique slug
const generateUniqueSlug = () => {
  return customAlphabet("abcdefghijklmnopqrstuvwxyz", 10)();
};

// Get all secrets for the current user
export const getUserSecrets = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await auth.api.getSession({ headers });
    const secrets = await db
      .select()
      .from(environment)
      .where(eq(environment.ownerId, session.user.id));
    return { secrets };
  }
);

// Get all secret views for the current user
export const getSecretViews = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await auth.api.getSession({ headers });
    const secretViews = await db
      .select()
      .from(secretView)
      .where(eq(secretView.userId, session.user.id));
    return { secretViews };
  }
);

// Create a new secret
export const createSecret = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return {
      name: data.get("name")?.toString() || "",
      description: data.get("description")?.toString() || "",
      variables: data.get("variables")?.toString() || "",
      isPublic: toBool(data.get("isPublic")),
      variablesPassword: data.get("variablesPassword")?.toString() || undefined,
      variablesHint: data.get("variablesHint")?.toString() || "",
      expiresAt: toDate(data.get("expiresAt")),
      isExpiring: toBool(data.get("isExpiring")),
      deletedAt: null as Date | null,
    };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await auth.api.getSession({ headers });
    const [secret] = await db
      .insert(environment)
      .values({
        name: data.name,
        slug: generateUniqueSlug(),
        description: data.description,
        variables: data.variables,
        isPublic: data.isPublic,
        variablesPassword: data.variablesPassword,
        variablesHint: data.variablesHint,
        expiresAt: data.expiresAt,
        isExpiring: data.isExpiring,
        deletedAt: data.deletedAt,
        ownerId: session.user.id,
      })
      .returning();
    return { secret };
  });

// Update a secret
export const updateSecret = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return {
      id: data.get("id")?.toString() || "",
      name: data.get("name")?.toString() || "",
      description: data.get("description")?.toString() || "",
      variables: data.get("variables")?.toString() || "",
      isPublic: toBool(data.get("isPublic")),
      variablesPassword: data.get("variablesPassword")?.toString() || undefined,
      variablesHint: data.get("variablesHint")?.toString() || "",
      expiresAt: toDate(data.get("expiresAt")),
      isExpiring: toBool(data.get("isExpiring")),
      deletedAt: null as Date | null,
    };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await getAuthenticatedUserId();
    const secret = await db
      .update(environment)
      .set(data)
      .where(and(eq(environment.id, data.id), eq(environment.ownerId, session)))
      .returning();
    return { secret: secret[0] };
  });

// Delete a secret
export const deleteSecret = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { id: data.get("id")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await getAuthenticatedUserId();
    const secret = await db
      .update(environment)
      .set({ deletedAt: new Date() })
      .where(and(eq(environment.id, data.id), eq(environment.ownerId, session)))
      .returning();
    return { secret: secret[0] };
  });

// Restore a deleted secret
export const restoreSecret = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { id: data.get("id")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await getAuthenticatedUserId();
    const secret = await db
      .update(environment)
      .set({ deletedAt: null })
      .where(and(eq(environment.id, data.id), eq(environment.ownerId, session)))
      .returning();
    return { secret: secret[0] };
  });

// Get a secret
export const getSecret = createServerFn({ method: "GET" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { id: data.get("id")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await getAuthenticatedUserId();
    const secret = await db
      .select()
      .from(environment)
      .where(
        and(eq(environment.id, data.id), eq(environment.ownerId, session))
      );
    return { secret: secret[0] };
  });

// Get a secret by slug
export const getSecretBySlug = createServerFn({ method: "GET" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { slug: data.get("slug")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    if (cookie) headers.set("cookie", cookie);
    const session = await getAuthenticatedUserId();
    const secret = await db
      .select()
      .from(environment)
      .where(
        and(eq(environment.slug, data.slug), eq(environment.ownerId, session))
      );
    return { secret: secret[0] };
  });

export const getSecretBySlugPublic = createServerFn({ method: "GET" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { slug: data.get("slug")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    const secret = await db
      .select()
      .from(environment)
      .where(eq(environment.slug, data.slug));
    return { secret: secret[0] };
  });

export const getSecretLink = createServerFn({ method: "GET" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return { slug: data.get("slug")?.toString() || "" };
  })
  .handler(async ({ data }) => {
    const headers = new Headers();
    const cookie = getRequestHeader("cookie");
    const referer = getRequestHeader("referer");
    if (cookie) headers.set("cookie", cookie);

    const session = await getAuthenticatedUserId();
    const secret = await db
      .select()
      .from(environment)
      .where(and(eq(environment.slug, data.slug)));
    if (!secret) {
      throw new Error("Secret not found");
    }
    return { link: `${referer}/secret/${secret[0].slug}` };
  });
