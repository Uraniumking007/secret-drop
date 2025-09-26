import { orgs } from "@/db/schema";

export type Organization = typeof orgs.$inferSelect;
