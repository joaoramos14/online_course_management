import type { MigrationBuilder } from "node-pg-migrate";

// Records which user watched which content (lesson).
// One row per user + content (a user cannot watch the same content twice).

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("content_views", {
        id: "id",
        user_id: {
            type: "integer",
            notNull: true,
            references: "users",
            onDelete: "CASCADE",
        },
        content_id: {
            type: "integer",
            notNull: true,
            references: "contents",
            onDelete: "CASCADE",
        },
        viewed_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });

    pgm.addConstraint("content_views", "content_views_user_id_content_id_unique", {
        unique: ["user_id", "content_id"],
    });
    pgm.createIndex("content_views", "content_id");
    pgm.sql("ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("content_views");
}
