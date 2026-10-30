# Guia de setup (temporário)

> Documento provisório para a equipe começar a trabalhar no projeto. Depois vamos juntar o que for útil ao `README.md`.

API REST para gerenciamento de cursos online (usuários, cursos, módulos e conteúdos).

**Stack:** Node.js 22 · TypeScript · Express 5 · Supabase (Postgres na nuvem)

---

## 1. Pré-requisitos

| Ferramenta | Para quê |
|---|---|
| [Git](https://git-scm.com/) | Clonar e versionar o código |
| [Node.js 22+](https://nodejs.org/) | Rodar a API (o npm já vem junto) |

Para conferir as versões:

```bash
git --version
node --version   # deve ser v22 ou superior
```

## 2. Clonar o repositório

```bash
git clone <URL-DO-REPOSITORIO>
cd online_course_management
```

## 3. Configurar o `.env`

O banco é o **Supabase na nuvem**: ninguém precisa instalar Postgres. Mas a API precisa das credenciais.

```bash
cp .env.example .env
```

Preencha o `.env`:

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (`https://<id>.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Chave secreta (`sb_secret_...`) |
| `PORT` | Porta da API (padrão `3000`) |
| `DATABASE_URL` | Conexão direta com o Postgres, usada **só** pelas migrations e seeders. Pegue em Supabase → **Connect** → *Session pooler* e troque `[YOUR-PASSWORD]` pela senha do banco (peça ao João) |

> ⚠️ **Peça as credenciais no grupo da equipe, em mensagem privada.**
> O `.env` está no `.gitignore` e **nunca** deve ser commitado. A chave secreta ignora as regras de segurança do banco (RLS); se vazar, qualquer pessoa pode ler e apagar tudo.

## 4. Instalar as dependências

```bash
npm ci
```

> Use `npm ci`, não `npm install`, para todo mundo ter as mesmas versões do `package-lock.json`. Só use `npm install <pacote>` quando for **adicionar** uma dependência, e commite o `package-lock.json` junto.

## 4.1 Banco de dados (migrations e seeders)

As tabelas são criadas por **migrations** (`database/migrations/`, biblioteca [node-pg-migrate](https://salsita.github.io/node-pg-migrate/)) e os dados de exemplo por **seeders** (`database/seeders/`). O diagrama do banco está em `docs/der.png`.

> O banco do Supabase é **compartilhado** pelo grupo. As migrations só precisam ser rodadas **uma vez** (por quem estiver configurando o banco). Os outros não precisam rodar nada.

```bash
npm run db:migrate    # cria as tabelas (só roda as migrations que ainda não foram aplicadas)
npm run db:seed       # APAGA os dados e insere os dados de exemplo
npm run db:rollback   # desfaz a última migration
```

> ⚠️ `db:seed` apaga todos os registros das tabelas antes de inserir. Não rode depois que o grupo já tiver cadastrado dados de teste importantes.

Os SQLs dos relatórios ficam em `database/01_...sql` até `database/05_...sql` e podem ser executados no **SQL Editor** do Supabase.

A API não roda SQL puro (o `supabase-js` não permite). Por isso, a migration `create-report-views` cria uma **view** para cada relatório, com o mesmo SQL dos arquivos, e a API lê essas views:

| Rota | Relatório |
|---|---|
| `GET /reports/users-most-courses` | SQL 01 - usuários com mais cursos |
| `GET /reports/course-most-contents` | SQL 02 - curso com mais conteúdos |
| `GET /reports/courses-totals` | SQL 03 - cursos com total de módulos e conteúdos |
| `GET /reports/contents-with-course` | SQL 04 - conteúdos com o nome do curso |
| `GET /reports/content-2-viewers` | SQL 05 - usuários que assistiram o conteúdo ID=2 |
| `GET /reports/content-viewers/:contentId` | SQL 05 para qualquer conteúdo |

> Se mudar um SQL de relatório, atualize também a view (com uma migration nova).

## 4.2 Front-end (React)

O front fica na pasta `frontend/` e consome a API. Veja `frontend/README.md`. Resumo:

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm run dev            # http://localhost:5173
```

A API precisa estar rodando (`npm run dev` na raiz).


## 4.3 Rotas de módulos e conteúdos

| Rota | O que faz |
|---|---|
| `GET /modules` | Lista os módulos (`?course_id=1` filtra por curso, ordenado por `position`) |
| `GET /modules/:id` | Busca um módulo |
| `POST /modules` | Cria um módulo (`course_id`, `user_id` e `title` obrigatórios) |
| `PUT /modules/:id` | Atualiza um módulo (só os campos enviados) |
| `DELETE /modules/:id` | Remove o módulo e os conteúdos dele |
| `GET /contents` | Lista os conteúdos (`?module_id=1` filtra por módulo, ordenado por `position`) |
| `GET /contents/:id` | Busca um conteúdo |
| `POST /contents` | Cria um conteúdo (`module_id`, `title` e `content` obrigatórios) |
| `PUT /contents/:id` | Atualiza um conteúdo (só os campos enviados) |
| `DELETE /contents/:id` | Remove um conteúdo |

Se `position` não for enviado no `POST`, o registro vai para o final do curso/módulo. `content_type` aceita `video` (padrão), `article` ou `quiz`.

Exemplo:

```bash
curl -X POST http://localhost:3000/modules   -H "Content-Type: application/json"   -d '{ "course_id": 1, "user_id": 1, "title": "Testing", "description": "Unit and integration tests." }'
```

Respostas de erro seguem o mesmo formato das outras rotas: `{ "message": "..." }`, com `400` (dados inválidos ou curso/módulo inexistente), `404` (registro não encontrado) e `409` (já existe um registro nessa `position`).


## 5. Subir o projeto

### Desenvolvimento (hot reload)

```bash
npm run dev
```

O servidor reinicia sozinho a cada alteração em `src/`.

### Build de produção

```bash
npm run build   # compila src/ para dist/
npm start       # roda o código compilado
```

> O `npm start` não lê o `.env` sozinho. Em produção, as variáveis vêm do ambiente do servidor. Para testar localmente, rode `node --env-file=.env dist/server.js`.

### Parar

`Ctrl + C` no terminal.

## 6. Verificar se subiu certo

**1. Log:** deve aparecer

```
Server running at http://localhost:3000
```

**2. Rota raiz:** abra http://localhost:3000 ou rode

```bash
curl http://localhost:3000/
```

Resposta esperada:

```json
{ "message": "Online Course Management API", "version": "1.0.0" }
```

> A rota `/` não consulta o banco. Ela confirma que o servidor está de pé, não que o Supabase está acessível.

## 7. Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API com hot reload, lendo o `.env` |
| `npm run build` | Compila `src/` para `dist/` |
| `npm start` | Roda o código compilado em `dist/` |
| `npm run db:migrate` | Cria/atualiza as tabelas no banco |
| `npm run db:rollback` | Desfaz a última migration |
| `npm run db:seed` | Apaga os dados e insere os dados de exemplo |
| `npm run db:check` | Confere os tipos dos arquivos de `database/` |

## 8. Estrutura de pastas

```
.
├── database/
│   ├── migrations/    # criação das tabelas (node-pg-migrate)
│   ├── seeders/       # dados de exemplo
│   └── 0X_*.sql       # SQLs dos relatórios
├── docs/              # DER (der.png e der.dot)
├── src/
│   ├── config/        # configurações (cliente do Supabase)
│   ├── controller/    # recebem a requisição e devolvem a resposta
│   ├── models/        # classes das entidades (User, Course, Module, Content)
│   ├── repository/    # acesso ao banco (consultas ao Supabase)
│   ├── routes/        # definição das rotas do Express
│   ├── app.ts         # cria o app Express e registra as rotas
│   └── server.ts      # ponto de entrada: sobe o servidor na porta
└── .env.example
```

As rotas de `users`, `courses`, `modules`, `contents` e `reports` já estão previstas (comentadas) em `src/app.ts`.

## 9. Problemas comuns

| Erro / sintoma | Causa | Solução |
|---|---|---|
| `node: .env: not found` ao rodar `npm run dev` | Falta o `.env` | Faça o passo 3 |
| `EADDRINUSE: address already in use :::3000` | Algo já está usando a porta 3000 | Feche o outro processo ou mude `PORT` no `.env` |
| `Cannot find module` / imports sublinhados no editor | Dependências não instaladas | Rode `npm ci` |
| `npm ci` reclama do lockfile | `package.json` e `package-lock.json` fora de sincronia | Rode `npm install`, teste e commite o `package-lock.json` atualizado |
| Erro de sintaxe ou de versão ao subir | Node antigo | Confira `node --version` (precisa ser 22+) |

## 10. Combinados da equipe

- Código, nomes de variáveis e mensagens de commit em **inglês**.
- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/), por exemplo:
  - `feat: add course listing route`
  - `fix: handle missing user id`
  - `chore: update dependencies`
- Não commite `.env`, `node_modules/` ou `dist/`; o `.gitignore` já cuida disso.
- Antes de abrir um PR, confira se `npm run build` passa.
