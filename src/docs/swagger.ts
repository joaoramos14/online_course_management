const idParam = (name: string) => ({
    name, in: "path", required: true, schema: { type: "integer" },
});

const ok = (description: string, ref?: string, array = false) => ({
    description,
    ...(ref && {
        content: {
            "application/json": {
                schema: array
                    ? { type: "array", items: { $ref: `#/components/schemas/${ref}` } }
                    : { $ref: `#/components/schemas/${ref}` },
            },
        },
    }),
});

const body = (ref: string) => ({
    required: true,
    content: { "application/json": { schema: { $ref: `#/components/schemas/${ref}` } } },
});

export const swaggerSpec = {
    openapi: "3.0.3",
    info: { title: "Online Course Management API", version: "1.0.0" },
    paths: {
        "/users": {
            get: { tags: ["Users"], summary: "List users", responses: { 200: ok("OK", "User", true) } },
            post: {
                tags: ["Users"], summary: "Create user", requestBody: body("UserInput"),
                responses: { 201: ok("Created", "User"), 400: ok("Invalid body"), 409: ok("Email already registered") },
            },
        },
        "/users/{id}": {
            get: {
                tags: ["Users"], summary: "Get user by id", parameters: [idParam("id")],
                responses: { 200: ok("OK", "User"), 404: ok("Not found") },
            },
            put: {
                tags: ["Users"], summary: "Update user", parameters: [idParam("id")],
                requestBody: body("UserInput"),
                responses: { 200: ok("OK", "User"), 400: ok("Invalid body"), 409: ok("Email already registered") },
            },
            delete: {
                tags: ["Users"], summary: "Delete user", parameters: [idParam("id")],
                responses: { 200: ok("Deleted"), 409: ok("User still has courses or modules") },
            },
        },
        "/courses": {
            get: { tags: ["Courses"], summary: "List courses", responses: { 200: ok("OK", "Course", true) } },
            post: {
                tags: ["Courses"], summary: "Create course", requestBody: body("CourseInput"),
                responses: { 201: ok("Created", "Course"), 400: ok("Invalid body"), 409: ok("Code already exists") },
            },
        },
        "/courses/search/{keyword}": {
            get: {
                tags: ["Courses"], summary: "Search courses by keyword",
                parameters: [{ name: "keyword", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: ok("OK", "Course", true) },
            },
        },
        "/courses/{courseId}": {
            get: {
                tags: ["Courses"], summary: "Get course by id", parameters: [idParam("courseId")],
                responses: { 200: ok("OK", "Course"), 404: ok("Not found") },
            },
            put: {
                tags: ["Courses"], summary: "Update course", parameters: [idParam("courseId")],
                requestBody: body("CourseInput"),
                responses: { 200: ok("OK", "Course"), 400: ok("Invalid body"), 409: ok("Code already exists") },
            },
            delete: {
                tags: ["Courses"], summary: "Delete course", parameters: [idParam("courseId")],
                responses: { 200: ok("Deleted"), 409: ok("Course still has modules") },
            },
        },
    },
    components: {
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: { type: "integer" }, name: { type: "string" }, email: { type: "string" },
                    status: { type: "string", example: "active" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            UserInput: {
                type: "object", required: ["name", "email"],
                properties: { name: { type: "string" }, email: { type: "string" }, status: { type: "string", example: "active" } },
            },
            Course: {
                type: "object",
                properties: {
                    id: { type: "integer" }, code: { type: "string" }, title: { type: "string" },
                    description: { type: "string" }, user_id: { type: "integer" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            CourseInput: {
                type: "object", required: ["code", "title", "user_id"],
                properties: {
                    code: { type: "string" }, title: { type: "string" },
                    description: { type: "string" }, user_id: { type: "integer" },
                },
            },
        },
    },
};