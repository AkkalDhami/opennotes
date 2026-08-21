//? Export all schemas from ./schemas directory
export * from "./schemas/user.schema"

export * from "./schemas/note.schema"
export * from "./schemas/download.schema"
export * from "./schemas/report.schema"
export * from "./schemas/bookmark.schema"
export * from "./schemas/account.schema"

export * from "./schemas/badge.schema"
export * from "./schemas/collection.schema"
export * from "./schemas/contributor.schema"
export * from "./schemas/contributor-profile.schema"

//? Export all relations from ./relations directory
export * from "./relations"

//? Export database connection
export { default as db } from "./connection"
