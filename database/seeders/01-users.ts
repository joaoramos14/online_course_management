import type { Client } from "pg";

const users = [
    { name: "Ana Souza", email: "ana.souza@example.com", status: "active" },
    { name: "Bruno Lima", email: "bruno.lima@example.com", status: "active" },
    { name: "Carla Mendes", email: "carla.mendes@example.com", status: "active" },
    { name: "Diego Ferreira", email: "diego.ferreira@example.com", status: "active" },
    { name: "Elisa Rocha", email: "elisa.rocha@example.com", status: "inactive" },
];

export async function seedUsers(client: Client): Promise<void> {
    for (const user of users) {
        await client.query(
            "INSERT INTO users (name, email, status) VALUES ($1, $2, $3)",
            [user.name, user.email, user.status],
        );
    }

    console.log(`users: ${users.length} inserted`);
}
