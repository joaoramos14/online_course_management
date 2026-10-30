WITH course_contents AS (
    SELECT
        c.id,
        c.title,
        COUNT(ct.id) AS total_contents
    FROM courses c
    LEFT JOIN modules m ON m.course_id = c.id
    LEFT JOIN contents ct ON ct.module_id = m.id
    GROUP BY c.id, c.title
)
SELECT id, title, total_contents
FROM course_contents
WHERE total_contents = (SELECT MAX(total_contents) FROM course_contents)
ORDER BY id;
