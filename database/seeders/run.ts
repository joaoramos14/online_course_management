import pg from "pg";
import { seedUsers } from "./01-users.js";
import { seedCourses } from "./02-courses.js";
import { seedContentViews } from "./03-content-views.js";

async function run(): Promise<void> {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set. Check your .env file.");
    }

    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            "TRUNCATE content_views, contents, modules, courses, users RESTART IDENTITY CASCADE",
        );

        await seedUsers(client);
        await seedCourses(client);
        await seedContentViews(client);

        await client.query("COMMIT");
        console.log("Seed completed.");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        await client.end();
    }
}

run().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
