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
                responses: { 200: ok("OK", "User"), 400: ok("Invalid id"), 404: ok("Not found") },
            },
            put: {
                tags: ["Users"], summary: "Update user", parameters: [idParam("id")],
                requestBody: body("UserInput"),
                responses: { 200: ok("OK", "User"), 400: ok("Invalid id or body"), 404: ok("Not found"), 409: ok("Email already registered") },
            },
            delete: {
                tags: ["Users"], summary: "Delete user", parameters: [idParam("id")],
                responses: { 200: ok("Deleted (also deletes the user's courses, modules and views)"), 400: ok("Invalid id"), 404: ok("Not found") },
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
                responses: { 200: ok("OK", "Course"), 400: ok("Invalid id"), 404: ok("Not found") },
            },
            put: {
                tags: ["Courses"], summary: "Update course", parameters: [idParam("courseId")],
                requestBody: body("CourseInput"),
                responses: { 200: ok("OK", "Course"), 400: ok("Invalid id or body"), 404: ok("Not found"), 409: ok("Code already exists") },
            },
            delete: {
                tags: ["Courses"], summary: "Delete course", parameters: [idParam("courseId")],
                responses: { 200: ok("Deleted (also deletes its modules and contents)"), 400: ok("Invalid id"), 404: ok("Not found") },
            },
        },
        "/modules": {
            get: {
                tags: ["Modules"], summary: "List modules",
                parameters: [{ name: "course_id", in: "query", required: false, schema: { type: "integer" } }],
                responses: { 200: ok("OK", "Module", true), 400: ok("Invalid course ID") },
            },
            post: {
                tags: ["Modules"], summary: "Create module", requestBody: body("ModuleInput"),
                responses: { 201: ok("Created", "Module"), 400: ok("Invalid body, course or user not found") },
            },
        },
        "/modules/{id}": {
            get: {
                tags: ["Modules"], summary: "Get module by id", parameters: [idParam("id")],
                responses: { 200: ok("OK", "Module"), 404: ok("Not found") },
            },
            put: {
                tags: ["Modules"], summary: "Update module", parameters: [idParam("id")],
                requestBody: body("ModuleInput"),
                responses: { 200: ok("OK", "Module"), 400: ok("Invalid body"), 404: ok("Not found") },
            },
            delete: {
                tags: ["Modules"], summary: "Delete module and its contents", parameters: [idParam("id")],
                responses: { 204: ok("Deleted"), 404: ok("Not found") },
            },
        },
        "/contents": {
            get: {
                tags: ["Contents"], summary: "List contents",
                parameters: [{ name: "module_id", in: "query", required: false, schema: { type: "integer" } }],
                responses: { 200: ok("OK", "Content", true), 400: ok("Invalid module ID") },
            },
            post: {
                tags: ["Contents"], summary: "Create content", requestBody: body("ContentInput"),
                responses: { 201: ok("Created", "Content"), 400: ok("Invalid body or module not found") },
            },
        },
        "/contents/{id}": {
            get: {
                tags: ["Contents"], summary: "Get content by id", parameters: [idParam("id")],
                responses: { 200: ok("OK", "Content"), 404: ok("Not found") },
            },
            put: {
                tags: ["Contents"], summary: "Update content", parameters: [idParam("id")],
                requestBody: body("ContentInput"),
                responses: { 200: ok("OK", "Content"), 400: ok("Invalid body"), 404: ok("Not found") },
            },
            delete: {
                tags: ["Contents"], summary: "Delete content", parameters: [idParam("id")],
                responses: { 204: ok("Deleted"), 404: ok("Not found") },
            },
        },
        "/contents/{id}/views": {
            get: {
                tags: ["Content views"], summary: "List users who watched the content", parameters: [idParam("id")],
                responses: { 200: ok("OK", "ContentView", true), 404: ok("Content not found") },
            },
            post: {
                tags: ["Content views"], summary: "Mark content as watched", parameters: [idParam("id")],
                requestBody: body("ContentViewInput"),
                responses: {
                    201: ok("Created", "ContentView"), 400: ok("Invalid user or user not found"),
                    404: ok("Content not found"), 409: ok("User already watched this content"),
                },
            },
        },
        "/contents/{id}/views/{userId}": {
            delete: {
                tags: ["Content views"], summary: "Unmark content as watched",
                parameters: [idParam("id"), idParam("userId")],
                responses: { 204: ok("Deleted"), 404: ok("View not found") },
            },
        },
        "/reports/users-most-courses": {
            get: {
                tags: ["Reports"], summary: "SQL 01 - Users with the most courses",
                responses: { 200: ok("OK", "ReportUsersMostCourses", true) },
            },
        },
        "/reports/course-most-contents": {
            get: {
                tags: ["Reports"], summary: "SQL 02 - Course(s) with the most contents (all in case of a tie)",
                responses: { 200: ok("OK", "ReportCourseMostContents", true) },
            },
        },
        "/reports/courses-totals": {
            get: {
                tags: ["Reports"], summary: "SQL 03 - Courses with total of modules and contents",
                responses: { 200: ok("OK", "ReportCoursesTotals", true) },
            },
        },
        "/reports/contents-with-course": {
            get: {
                tags: ["Reports"], summary: "SQL 04 - Contents with the course name",
                responses: { 200: ok("OK", "ReportContentsWithCourse", true) },
            },
        },
        "/reports/content-2-viewers": {
            get: {
                tags: ["Reports"], summary: "SQL 05 - Users who watched the content ID = 2",
                responses: { 200: ok("OK", "ReportContentViewers", true) },
            },
        },
        "/reports/content-viewers/{contentId}": {
            get: {
                tags: ["Reports"], summary: "SQL 05 for any content",
                parameters: [idParam("contentId")],
                responses: { 200: ok("OK", "ReportContentViewers", true), 400: ok("Invalid content id") },
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
            Module: {
                type: "object",
                properties: {
                    id: { type: "integer" }, course_id: { type: "integer" }, user_id: { type: "integer" },
                    title: { type: "string" }, description: { type: "string" }, position: { type: "integer" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            ModuleInput: {
                type: "object", required: ["course_id", "user_id", "title"],
                properties: {
                    course_id: { type: "integer" }, user_id: { type: "integer" }, title: { type: "string" },
                    description: { type: "string" }, position: { type: "integer" },
                },
            },
            Content: {
                type: "object",
                properties: {
                    id: { type: "integer" }, module_id: { type: "integer" }, title: { type: "string" },
                    content: { type: "string" }, content_type: { type: "string", example: "video" },
                    position: { type: "integer" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            ContentInput: {
                type: "object", required: ["module_id", "title", "content"],
                properties: {
                    module_id: { type: "integer" }, title: { type: "string" }, content: { type: "string" },
                    content_type: { type: "string", enum: ["video", "article", "quiz"] },
                    position: { type: "integer" },
                },
            },
            ContentView: {
                type: "object",
                properties: {
                    id: { type: "integer" }, user_id: { type: "integer" }, content_id: { type: "integer" },
                    viewed_at: { type: "string", format: "date-time" },
                },
            },
            ContentViewInput: {
                type: "object", required: ["user_id"],
                properties: { user_id: { type: "integer" } },
            },
            ReportUsersMostCourses: {
                type: "object",
                properties: {
                    id: { type: "integer" }, name: { type: "string" }, email: { type: "string" },
                    total_courses: { type: "integer" },
                },
            },
            ReportCourseMostContents: {
                type: "object",
                properties: {
                    id: { type: "integer" }, code: { type: "string" }, title: { type: "string" },
                    total_contents: { type: "integer" },
                },
            },
            ReportCoursesTotals: {
                type: "object",
                properties: {
                    id: { type: "integer" }, code: { type: "string" }, title: { type: "string" },
                    total_modules: { type: "integer" }, total_contents: { type: "integer" },
                },
            },
            ReportContentsWithCourse: {
                type: "object",
                properties: {
                    content_id: { type: "integer" }, content_title: { type: "string" },
                    content_type: { type: "string" }, module_title: { type: "string" },
                    course_code: { type: "string" }, course_title: { type: "string" },
                },
            },
            ReportContentViewers: {
                type: "object",
                properties: {
                    user_id: { type: "integer" }, name: { type: "string" }, email: { type: "string" },
                    content_id: { type: "integer" }, content_title: { type: "string" },
                    viewed_at: { type: "string", format: "date-time" },
                },
            },
        },
    },
};
