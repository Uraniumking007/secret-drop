import handler from "./src/server";

const server = Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  fetch: (req) => handler({ request: req }),
});

console.log(`Secretdrop running on http://localhost:${server.port}`);
