export interface Course {
    id: number;
    code: string;
    title: string;
    description: string | null;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface CourseInput {
    code: string;
    title: string;
    description: string | null;
    user_id: number;
}