import type { Client } from "pg";

type ContentType = "video" | "article" | "quiz";

interface ContentSeed {
    title: string;
    type: ContentType;
}

interface ModuleSeed {
    title: string;
    description: string;
    contents: ContentSeed[];
}

interface CourseSeed {
    userId: number;
    code: string;
    title: string;
    description: string;
    modules: ModuleSeed[];
}

const video = (title: string): ContentSeed => ({ title, type: "video" });
const article = (title: string): ContentSeed => ({ title, type: "article" });
const quiz = (title: string): ContentSeed => ({ title, type: "quiz" });

// Builds the "content" column value according to the content type.
function buildContent(courseCode: string, content: ContentSeed): string {
    const slug = content.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    switch (content.type) {
        case "video":
            return `https://videos.example.com/${courseCode.toLowerCase()}/${slug}`;
        case "article":
            return `Reading material about "${content.title}".`;
        case "quiz":
            return `Multiple choice questions to review "${content.title}".`;
    }
}

const courses: CourseSeed[] = [
    // Course 1: 5 modules x 3 contents = 15 contents
    {
        userId: 1,
        code: "NODE-101",
        title: "Node.js and TypeScript from Scratch",
        description: "Learn how to build modern APIs with Node.js and TypeScript.",
        modules: [
            {
                title: "Introduction to Node.js",
                description: "What Node.js is and how to set up the environment.",
                contents: [
                    video("What is Node.js"),
                    video("Setting up the environment"),
                    article("Modules and NPM"),
                ],
            },
            {
                title: "TypeScript Fundamentals",
                description: "Types, interfaces and classes.",
                contents: [
                    video("Basic types"),
                    video("Interfaces and classes"),
                    quiz("Quiz: TypeScript fundamentals"),
                ],
            },
            {
                title: "Building an API with Express",
                description: "Routes, middlewares and layered architecture.",
                contents: [
                    video("First route"),
                    video("Middlewares"),
                    article("Layered architecture"),
                ],
            },
            {
                title: "Database Integration",
                description: "Connecting the API to a PostgreSQL database.",
                contents: [
                    video("Connecting to Postgres"),
                    video("Queries with Supabase"),
                    article("Migrations and seeders"),
                ],
            },
            {
                title: "Deployment",
                description: "Preparing the application for production.",
                contents: [
                    video("Environment variables"),
                    article("Production build"),
                    quiz("Final quiz"),
                ],
            },
        ],
    },
    // Course 2: 3 modules x 5 contents = 15 contents
    {
        userId: 1,
        code: "SQL-201",
        title: "Relational Databases with PostgreSQL",
        description: "Data modeling, SQL and best practices with PostgreSQL.",
        modules: [
            {
                title: "Data Modeling",
                description: "Entities, relationships and normalization.",
                contents: [
                    video("Entities and attributes"),
                    video("Relationships"),
                    video("Primary and foreign keys"),
                    article("Normalization"),
                    quiz("Quiz: data modeling"),
                ],
            },
            {
                title: "Essential SQL",
                description: "Queries, joins and aggregations.",
                contents: [
                    video("SELECT and filters"),
                    video("JOINs"),
                    video("GROUP BY and aggregations"),
                    article("Subqueries and CTEs"),
                    quiz("Quiz: SQL"),
                ],
            },
            {
                title: "Performance",
                description: "Indexes, query plans and transactions.",
                contents: [
                    video("Indexes"),
                    video("EXPLAIN ANALYZE"),
                    article("Transactions"),
                    article("Migration best practices"),
                    quiz("Final quiz"),
                ],
            },
        ],
    },
    // Course 3: 2 modules x 4 contents = 8 contents
    {
        userId: 2,
        code: "GIT-101",
        title: "Git and GitHub for Teams",
        description: "Collaborative workflow with Git and GitHub.",
        modules: [
            {
                title: "Git in Practice",
                description: "Commits, branches and history.",
                contents: [
                    video("Commits and branches"),
                    video("Merge and rebase"),
                    article("Conventional Commits"),
                    quiz("Quiz: Git"),
                ],
            },
            {
                title: "Collaborating on GitHub",
                description: "Pull requests, code review and conflicts.",
                contents: [
                    video("Pull requests"),
                    video("Code review"),
                    article("Resolving conflicts"),
                    quiz("Quiz: GitHub"),
                ],
            },
        ],
    },
    // Course 4: 1 module x 3 contents = 3 contents
    {
        userId: 3,
        code: "API-101",
        title: "Introduction to REST APIs",
        description: "Basic concepts of REST APIs and HTTP.",
        modules: [
            {
                title: "REST Concepts",
                description: "Resources, HTTP methods and status codes.",
                contents: [
                    video("What is an API"),
                    article("HTTP methods and status codes"),
                    quiz("Quiz: REST"),
                ],
            },
        ],
    },
    // Course 5: 2 modules x 2 contents = 4 contents
    {
        userId: 4,
        code: "LOGIC-101",
        title: "Programming Logic",
        description: "First steps for those who are starting to program.",
        modules: [
            {
                title: "Algorithms",
                description: "What an algorithm is and how to represent it.",
                contents: [
                    video("What is an algorithm"),
                    article("Flowcharts"),
                ],
            },
            {
                title: "Control Structures",
                description: "Conditionals and loops.",
                contents: [
                    video("Conditionals"),
                    video("Loops"),
                ],
            },
        ],
    },
];

export async function seedCourses(client: Client): Promise<void> {
    let totalModules = 0;
    let totalContents = 0;

    for (const course of courses) {
        const courseResult = await client.query<{ id: number }>(
            "INSERT INTO courses (user_id, code, title, description) VALUES ($1, $2, $3, $4) RETURNING id",
            [course.userId, course.code, course.title, course.description],
        );
        const courseId = courseResult.rows[0]!.id;

        for (const [moduleIndex, module] of course.modules.entries()) {
            // The module is created by the same user who created the course
            const moduleResult = await client.query<{ id: number }>(
                "INSERT INTO modules (course_id, user_id, title, description, position) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [courseId, course.userId, module.title, module.description, moduleIndex + 1],
            );
            const moduleId = moduleResult.rows[0]!.id;
            totalModules++;

            for (const [contentIndex, content] of module.contents.entries()) {
                await client.query(
                    "INSERT INTO contents (module_id, title, content, content_type, position) VALUES ($1, $2, $3, $4, $5)",
                    [moduleId, content.title, buildContent(course.code, content), content.type, contentIndex + 1],
                );
                totalContents++;
            }
        }
    }

    console.log(
        `courses: ${courses.length} inserted (${totalModules} modules, ${totalContents} contents)`,
    );
}
