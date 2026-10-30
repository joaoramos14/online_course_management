SELECT
    c.id,
    c.title,
    COUNT(DISTINCT m.id) AS total_modules,
    COUNT(ct.id) AS total_contents
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN contents ct ON ct.module_id = m.id
GROUP BY c.id, c.title
ORDER BY c.id;
