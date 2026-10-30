export interface Module {
    id: number;
    course_id: number;
    // User who created the module
    user_id: number;
    title: string;
    description: string | null;
    position: number;
    created_at: string;
    updated_at: string;
}

// Fields accepted on create/update. "position" is optional on create:
// when it's not sent, the module goes to the end of the course.
export interface ModuleInput {
    course_id: number;
    user_id: number;
    title: string;
    description?: string | null;
    position?: number;
}
