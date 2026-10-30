import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("courses", {
        id: "id",
        user_id: {
            type: "integer",
            notNull: true,
            references: "users",
            onDelete: "CASCADE",
        },
        code: { type: "varchar(30)", notNull: true, unique: true },
        title: { type: "varchar(150)", notNull: true },
        description: { type: "text" },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });

    pgm.createIndex("courses", "user_id");
    pgm.sql(`
        CREATE TRIGGER courses_set_updated_at
        BEFORE UPDATE ON courses
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
    pgm.sql("ALTER TABLE courses ENABLE ROW LEVEL SECURITY;");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("courses");
}
