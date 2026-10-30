-- SQL 03: All courses with the total of modules and contents of each one (single query)
SELECT
    c.id,
    c.code,
    c.title,
    COUNT(DISTINCT m.id)::int AS total_modules,
    COUNT(ct.id)::int AS total_contents
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN contents ct ON ct.module_id = m.id
GROUP BY c.id, c.code, c.title
ORDER BY c.id;
