import { pgTable, uuid, varchar, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./user.schema";


export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: varchar("provider", { length: 50 }).notNull(),

    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_idx").on(
      table.provider,
      table.providerAccountId
    ),
  ]
)
