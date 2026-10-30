import type { MigrationBuilder } from "node-pg-migrate";

// Views with the report queries (same SQL as the files database/0X_*.sql).
// The API reads them with supabase.from("report_..."), because Supabase JS
// cannot run raw SQL. "security_invoker" makes the views respect the RLS of
// the underlying tables.
export async function up(pgm: MigrationBuilder): Promise<void> {
    // SQL 01
    pgm.sql(`
        CREATE VIEW report_users_most_courses WITH (security_invoker = true) AS
        SELECT
            u.id,
            u.name,
            u.email,
            COUNT(c.id)::int AS total_courses
        FROM users u
        LEFT JOIN courses c ON c.user_id = u.id
        GROUP BY u.id, u.name, u.email
        ORDER BY total_courses DESC, u.name;
    `);

    // SQL 02
    pgm.sql(`
        CREATE VIEW report_course_most_contents WITH (security_invoker = true) AS
        WITH course_contents AS (
            SELECT
                c.id,
                c.code,
                c.title,
                COUNT(ct.id)::int AS total_contents
            FROM courses c
            LEFT JOIN modules m ON m.course_id = c.id
            LEFT JOIN contents ct ON ct.module_id = m.id
            GROUP BY c.id, c.code, c.title
        )
        SELECT id, code, title, total_contents
        FROM course_contents
        WHERE total_contents = (SELECT MAX(total_contents) FROM course_contents)
        ORDER BY id;
    `);

    // SQL 03
    pgm.sql(`
        CREATE VIEW report_courses_totals WITH (security_invoker = true) AS
        SELECT
            c.id,
            c.code,
            c.title,
            COUNT(DISTINCT m.id)::int AS total_modules,
            COUNT(ct.id)::int AS total_contents
        FROM courses c
        LEFT JOIN modules m ON m.course_id = c.id
        LEFT JOIN contents ct ON ct.module_id = m.id
        GROUP BY c.id, c.code, c.title
        ORDER BY c.id;
    `);

    // SQL 04
    pgm.sql(`
        CREATE VIEW report_contents_with_course WITH (security_invoker = true) AS
        SELECT
            ct.id AS content_id,
            ct.title AS content_title,
            ct.content_type,
            m.title AS module_title,
            c.code AS course_code,
            c.title AS course_title
        FROM contents ct
        JOIN modules m ON m.id = ct.module_id
        JOIN courses c ON c.id = m.course_id
        ORDER BY c.id, m.position, ct.position;
    `);

    // SQL 05 (without the "content_id = 2" filter, which is applied by the API)
    pgm.sql(`
        CREATE VIEW report_content_viewers WITH (security_invoker = true) AS
        SELECT
            u.id AS user_id,
            u.name,
            u.email,
            ct.id AS content_id,
            ct.title AS content_title,
            cv.viewed_at
        FROM content_views cv
        JOIN users u ON u.id = cv.user_id
        JOIN contents ct ON ct.id = cv.content_id
        ORDER BY cv.viewed_at, u.name;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.sql("DROP VIEW IF EXISTS report_content_viewers;");
    pgm.sql("DROP VIEW IF EXISTS report_contents_with_course;");
    pgm.sql("DROP VIEW IF EXISTS report_courses_totals;");
    pgm.sql("DROP VIEW IF EXISTS report_course_most_contents;");
    pgm.sql("DROP VIEW IF EXISTS report_users_most_courses;");
}
