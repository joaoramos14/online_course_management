SELECT
    ct.id AS content_id,
    ct.title AS content_title,
    ct.content_type,
    m.title AS module_title,
    c.title AS course_title
FROM contents ct
JOIN modules m ON m.id = ct.module_id
JOIN courses c ON c.id = m.course_id
ORDER BY c.id, m.position, ct.position;
