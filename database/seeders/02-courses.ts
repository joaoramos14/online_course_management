import type { Client } from "pg";

type ContentType = "video" | "article" | "quiz";

interface ContentSeed {
    title: string;
    type: ContentType;
}

interface ModuleSeed {
    title: string;
    contents: ContentSeed[];
}

interface CourseSeed {
    userId: number;
    title: string;
    description: string;
    modules: ModuleSeed[];
}

const video = (title: string): ContentSeed => ({ title, type: "video" });
const article = (title: string): ContentSeed => ({ title, type: "article" });
const quiz = (title: string): ContentSeed => ({ title, type: "quiz" });

const courses: CourseSeed[] = [
    // Course 1: 5 modules x 3 contents = 15 contents
    {
        userId: 1,
        title: "Node.js e TypeScript do Zero",
        description: "Aprenda a construir APIs modernas com Node.js e TypeScript.",
        modules: [
            {
                title: "Introdução ao Node.js",
                contents: [
                    video("O que é Node.js"),
                    video("Instalando o ambiente"),
                    article("Módulos e NPM"),
                ],
            },
            {
                title: "Fundamentos de TypeScript",
                contents: [
                    video("Tipos básicos"),
                    video("Interfaces e classes"),
                    quiz("Quiz: fundamentos de TypeScript"),
                ],
            },
            {
                title: "Criando uma API com Express",
                contents: [
                    video("Primeira rota"),
                    video("Middlewares"),
                    article("Organização em camadas"),
                ],
            },
            {
                title: "Integração com banco de dados",
                contents: [
                    video("Conectando ao Postgres"),
                    video("Consultas com Supabase"),
                    article("Migrations e seeders"),
                ],
            },
            {
                title: "Publicação",
                contents: [
                    video("Variáveis de ambiente"),
                    article("Build para produção"),
                    quiz("Quiz final"),
                ],
            },
        ],
    },
    // Course 2: 3 modules x 5 contents = 15 contents
    {
        userId: 1,
        title: "Banco de Dados Relacional com PostgreSQL",
        description: "Modelagem, SQL e boas práticas com PostgreSQL.",
        modules: [
            {
                title: "Modelagem de dados",
                contents: [
                    video("Entidades e atributos"),
                    video("Relacionamentos"),
                    video("Chaves primárias e estrangeiras"),
                    article("Normalização"),
                    quiz("Quiz: modelagem"),
                ],
            },
            {
                title: "SQL essencial",
                contents: [
                    video("SELECT e filtros"),
                    video("JOINs"),
                    video("GROUP BY e agregações"),
                    article("Subconsultas e CTEs"),
                    quiz("Quiz: SQL"),
                ],
            },
            {
                title: "Performance",
                contents: [
                    video("Índices"),
                    video("EXPLAIN ANALYZE"),
                    article("Transações"),
                    article("Boas práticas de migrations"),
                    quiz("Quiz final"),
                ],
            },
        ],
    },
    // Course 3: 2 modules x 4 contents = 8 contents
    {
        userId: 2,
        title: "Git e GitHub para Equipes",
        description: "Fluxo de trabalho colaborativo com Git.",
        modules: [
            {
                title: "Git na prática",
                contents: [
                    video("Commits e branches"),
                    video("Merge e rebase"),
                    article("Conventional Commits"),
                    quiz("Quiz: Git"),
                ],
            },
            {
                title: "Colaboração no GitHub",
                contents: [
                    video("Pull requests"),
                    video("Code review"),
                    article("Resolvendo conflitos"),
                    quiz("Quiz: GitHub"),
                ],
            },
        ],
    },
    // Course 4: 1 module x 3 contents = 3 contents
    {
        userId: 3,
        title: "Introdução a APIs REST",
        description: "Conceitos básicos de APIs REST e HTTP.",
        modules: [
            {
                title: "Conceitos de REST",
                contents: [
                    video("O que é uma API"),
                    article("Verbos e códigos HTTP"),
                    quiz("Quiz: REST"),
                ],
            },
        ],
    },
    // Course 5: 2 modules x 2 contents = 4 contents
    {
        userId: 4,
        title: "Lógica de Programação",
        description: "Primeiros passos para quem está começando a programar.",
        modules: [
            {
                title: "Algoritmos",
                contents: [
                    video("O que é um algoritmo"),
                    article("Fluxogramas"),
                ],
            },
            {
                title: "Estruturas de controle",
                contents: [
                    video("Condicionais"),
                    video("Laços de repetição"),
                ],
            },
        ],
    },
];

export async function seedCourses(client: Client): Promise<void> {
    let totalModules = 0;
    let totalContents = 0;

    for (const course of courses) {
        const courseResult = await client.query<{ id: number }>(
            "INSERT INTO courses (user_id, title, description) VALUES ($1, $2, $3) RETURNING id",
            [course.userId, course.title, course.description],
        );
        const courseId = courseResult.rows[0]!.id;

        for (const [moduleIndex, module] of course.modules.entries()) {
            const moduleResult = await client.query<{ id: number }>(
                "INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id",
                [courseId, module.title, moduleIndex + 1],
            );
            const moduleId = moduleResult.rows[0]!.id;
            totalModules++;

            for (const [contentIndex, content] of module.contents.entries()) {
                await client.query(
                    "INSERT INTO contents (module_id, title, content_type, position) VALUES ($1, $2, $3, $4)",
                    [moduleId, content.title, content.type, contentIndex + 1],
                );
                totalContents++;
            }
        }
    }

    console.log(
        `courses: ${courses.length} inserted (${totalModules} modules, ${totalContents} contents)`,
    );
}
