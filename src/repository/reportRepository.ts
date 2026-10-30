import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

// Supabase JS can't run raw SQL, so reports use pg and the .sql files in /database.
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function runSqlFile(file: string) {
    const sql = await readFile(path.join(process.cwd(), "database", file), "utf-8");
    const { rows } = await pool.query(sql);
    return rows;
}

const usersWithMostCourses = () => runSqlFile("01_users_with_most_courses.sql");
const courseWithMostContents = () => runSqlFile("02_course_with_most_contents.sql");
const coursesWithTotals = () => runSqlFile("03_courses_with_total_modules_and_contents.sql");
const contentsWithCourseName = () => runSqlFile("04_contents_with_course_name.sql");
const usersWhoWatchedContent2 = () => runSqlFile("05_users_who_watched_content_2.sql");

export default {
    usersWithMostCourses,
    courseWithMostContents,
    coursesWithTotals,
    contentsWithCourseName,
    usersWhoWatchedContent2,
};
