-- SQL 01: Which users have the most courses?
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(c.id) AS total_courses
FROM users u
LEFT JOIN courses c ON c.user_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY total_courses DESC, u.name;
