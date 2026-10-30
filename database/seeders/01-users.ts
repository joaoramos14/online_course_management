import type { Client } from "pg";

const users = [
    { name: "Ana Souza", email: "ana.souza@example.com" },
    { name: "Bruno Lima", email: "bruno.lima@example.com" },
    { name: "Carla Mendes", email: "carla.mendes@example.com" },
    { name: "Diego Ferreira", email: "diego.ferreira@example.com" },
    { name: "Elisa Rocha", email: "elisa.rocha@example.com" },
];

export async function seedUsers(client: Client): Promise<void> {
    for (const user of users) {
        await client.query(
            "INSERT INTO users (name, email) VALUES ($1, $2)",
            [user.name, user.email],
        );
    }

    console.log(`users: ${users.length} inserted`);
}
