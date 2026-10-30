import type { MigrationBuilder } from "node-pg-migrate";

// Function used by triggers to keep the "updated_at" column up to date
// every time a row is updated.
export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.sql(`
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS trigger AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.sql("DROP FUNCTION IF EXISTS set_updated_at();");
}
