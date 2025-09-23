import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/health").methods({
  GET: () => {
    return Response.json(
      {
        status: "ok",
        runtime: "web",
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      }
    );
  },
  POST: async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    return Response.json(
      {
        status: "ok",
        received: body,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      }
    );
  },
});
