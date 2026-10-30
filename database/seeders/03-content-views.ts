import type { Client } from "pg";

const contentViews: Array<{ userId: number; contentId: number }> = [
    { userId: 1, contentId: 2 },
    { userId: 2, contentId: 2 },
    { userId: 4, contentId: 2 },

    { userId: 1, contentId: 1 },
    { userId: 2, contentId: 1 },
    { userId: 2, contentId: 3 },
    { userId: 3, contentId: 1 },
    { userId: 3, contentId: 16 },
    { userId: 3, contentId: 17 },
    { userId: 4, contentId: 31 },
    { userId: 5, contentId: 39 },
    { userId: 5, contentId: 42 },
    { userId: 5, contentId: 43 },
];

export async function seedContentViews(client: Client): Promise<void> {
    for (const view of contentViews) {
        await client.query(
            "INSERT INTO content_views (user_id, content_id) VALUES ($1, $2)",
            [view.userId, view.contentId],
        );
    }

    console.log(`content_views: ${contentViews.length} inserted`);
}
