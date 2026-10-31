export interface User {
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface UserInput {
    name: string;
    email: string;
    status: string;
}