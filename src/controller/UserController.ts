import type { Request, Response } from "express";
import userRepository from "../repository/userRepository.js";

// Returns true when the route param is a positive integer id.
function isValidId(id: string | undefined): id is string {
    return id !== undefined && /^[1-9]\d*$/.test(id);
}

// PGRST116 = no row found (".single()" returned nothing)
function isNotFound(error: unknown) {
    return (error as { code?: string }).code === "PGRST116";
}

const USER_STATUSES = ["active", "inactive"];

function isValidStatus(status: unknown) {
    return status === undefined || (typeof status === "string" && USER_STATUSES.includes(status));
}

async function getAll(req: Request, res: Response) {
    try {
        const users = await userRepository.findAll();

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users: ", error);

        res.status(500).json({
            message: "Error fetching users.",
        });
    }
}

async function getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isValidId(id)) {
        res.status(400).json({
            message: "Invalid user ID."
        });
        return;
    }

    try {
        const user = await userRepository.findById(id);

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user: ", error);

        res.status(404).json({
            message: "User not found.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { name, email, status } = req.body;

    if (!name || typeof name != "string") {
        res.status(400).json({
            message: "User name is required."
        });
        return;
    }

    if (!email || typeof email != "string") {
        res.status(400).json({
            message: "User email is required."
        });
        return;
    }

    if (!isValidStatus(status)) {
        res.status(400).json({
            message: "Status must be active or inactive."
        });
        return;
    }

    try {
        const user = await userRepository.create({
            name,
            email,
            status: status ?? "active",
        });

        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user: ", error);

        // 23505 = email already registered
        if ((error as { code?: string }).code === "23505") {
            res.status(409).json({
                message: "This email is already registered.",
            });
            return;
        }

        res.status(500).json({
            message: "Error creating user.",
        });
    }
}

async function update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { name, email, status } = req.body;

    if (!isValidId(id)) {
        res.status(400).json({
            message: "Invalid user ID."
        });
        return;
    }

    if (!name || typeof name != "string") {
        res.status(400).json({
            message: "User name is required."
        });
        return;
    }

    if (!email || typeof email != "string") {
        res.status(400).json({
            message: "User email is required."
        });
        return;
    }

    if (!isValidStatus(status)) {
        res.status(400).json({
            message: "Status must be active or inactive."
        });
        return;
    }

    try {
        const user = await userRepository.update(id, {
            name,
            email,
            status: status ?? "active",
        });

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user: ", error);

        if (isNotFound(error)) {
            res.status(404).json({
                message: "User not found.",
            });
            return;
        }

        if ((error as { code?: string }).code === "23505") {
            res.status(409).json({
                message: "This email is already registered.",
            });
            return;
        }

        res.status(500).json({
            message: "Error updating user.",
        });
    }
}

async function remove(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    if (!isValidId(id)) {
        res.status(400).json({
            message: "Invalid user ID."
        });
        return;
    }

    try {
        await userRepository.remove(id);

        res.status(200).json({
            message: "User removed successfully.",
        });
    } catch (error) {
        console.error("Error removing user: ", error);

        if (isNotFound(error)) {
            res.status(404).json({
                message: "User not found.",
            });
            return;
        }

        // 23503 = user still has courses or modules linked to it
        if ((error as { code?: string }).code === "23503") {
            res.status(409).json({
                message: "This user has courses or modules. Remove them first.",
            });
            return;
        }

        res.status(500).json({
            message: "Error removing user.",
        });
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
}
