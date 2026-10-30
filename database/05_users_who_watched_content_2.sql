SELECT
    u.id AS user_id,
    u.name,
    u.email,
    ct.id AS content_id,
    ct.title AS content_title,
    cv.viewed_at
FROM content_views cv
JOIN users u ON u.id = cv.user_id
JOIN contents ct ON ct.id = cv.content_id
WHERE cv.content_id = 2
ORDER BY cv.viewed_at, u.name;
