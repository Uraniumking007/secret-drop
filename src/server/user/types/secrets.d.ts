import { environment, secretView } from "@/db/schema";

export type Secret = typeof environment.$inferSelect;
export type SecretInsert = typeof environment.$inferInsert;
export type SecretView = typeof secretView.$inferSelect;
export type SecretViewInsert = typeof secretView.$inferInsert;
