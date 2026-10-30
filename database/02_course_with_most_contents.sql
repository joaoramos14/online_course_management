-- SQL 02: Which course has the most contents? (returns all courses in case of a tie)
WITH course_contents AS (
    SELECT
        c.id,
        c.code,
        c.title,
        COUNT(ct.id)::int AS total_contents
    FROM courses c
    LEFT JOIN modules m ON m.course_id = c.id
    LEFT JOIN contents ct ON ct.module_id = m.id
    GROUP BY c.id, c.code, c.title
)
SELECT id, code, title, total_contents
FROM course_contents
WHERE total_contents = (SELECT MAX(total_contents) FROM course_contents)
ORDER BY id;
