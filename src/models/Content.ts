export const CONTENT_TYPES = ["video", "article", "quiz"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export interface Content {
    id: number;
    module_id: number;
    title: string;
    // Video URL, article text or quiz description
    content: string;
    content_type: ContentType;
    position: number;
    created_at: string;
    updated_at: string;
}

// "content_type" defaults to "video" in the database and "position"
// defaults to the end of the module, so both are optional on create.
export interface ContentInput {
    module_id: number;
    title: string;
    content: string;
    content_type?: ContentType;
    position?: number;
}
