import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("contents", {
        id: "id",
        module_id: {
            type: "integer",
            notNull: true,
            references: "modules",
            onDelete: "CASCADE",
        },
        title: { type: "varchar(150)", notNull: true },
        content_type: { type: "varchar(20)", notNull: true, default: "video" },
        position: { type: "integer", notNull: true },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });

    pgm.addConstraint("contents", "contents_content_type_valid", {
        check: "content_type IN ('video', 'article', 'quiz')",
    });
    pgm.addConstraint("contents", "contents_position_positive", {
        check: "position > 0",
    });
    pgm.addConstraint("contents", "contents_module_id_position_unique", {
        unique: ["module_id", "position"],
    });
    pgm.createIndex("contents", "module_id");
    pgm.sql("ALTER TABLE contents ENABLE ROW LEVEL SECURITY;");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("contents");
}
