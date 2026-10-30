import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("modules", {
        id: "id",
        course_id: {
            type: "integer",
            notNull: true,
            references: "courses",
            onDelete: "CASCADE",
        },
        title: { type: "varchar(150)", notNull: true },
        position: { type: "integer", notNull: true },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });

    pgm.addConstraint("modules", "modules_position_positive", {
        check: "position > 0",
    });
    pgm.addConstraint("modules", "modules_course_id_position_unique", {
        unique: ["course_id", "position"],
    });
    pgm.createIndex("modules", "course_id");
    pgm.sql("ALTER TABLE modules ENABLE ROW LEVEL SECURITY;");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("modules");
}
