// A user that watched a content (lesson)
export interface ContentView {
    id: number;
    user_id: number;
    content_id: number;
    viewed_at: string;
}
