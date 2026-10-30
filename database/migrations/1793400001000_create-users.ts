import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("users", {
        id: "id",
        name: { type: "varchar(100)", notNull: true },
        email: { type: "varchar(255)", notNull: true, unique: true },
        status: { type: "varchar(20)", notNull: true, default: "active" },
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

    pgm.addConstraint("users", "users_status_valid", {
        check: "status IN ('active', 'inactive')",
    });
    pgm.sql(`
        CREATE TRIGGER users_set_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
    pgm.sql("ALTER TABLE users ENABLE ROW LEVEL SECURITY;");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("users");
}
