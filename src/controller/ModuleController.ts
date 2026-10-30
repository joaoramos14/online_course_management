import type { Request, Response } from "express";
import ModuleRepository from "../repository/ModuleRepository.js";
import type { ModuleInput } from "../models/Module.js";

function parseId(value: unknown) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

// Validates the request body. On update every field is optional,
// on create course_id, user_id and title are required.
function readBody(body: Record<string, unknown>, isUpdate: boolean) {
    const data: Partial<ModuleInput> = {};

    if (!isUpdate || body.course_id !== undefined) {
        const courseId = parseId(body.course_id);
        if (!courseId) return { error: "Invalid course ID." };
        data.course_id = courseId;
    }

    if (!isUpdate || body.user_id !== undefined) {
        const userId = parseId(body.user_id);
        if (!userId) return { error: "Invalid user ID." };
        data.user_id = userId;
    }

    if (!isUpdate || body.title !== undefined) {
        if (typeof body.title !== "string" || body.title.trim() === "") {
            return { error: "Title is required." };
        }
        if (body.title.trim().length > 150) {
            return { error: "Title must have at most 150 characters." };
        }
        data.title = body.title.trim();
    }

    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== "string") {
            return { error: "Description must be a text." };
        }
        data.description = body.description.trim() || null;
    } else if (body.description === null) {
        data.description = null;
    }

    if (body.position !== undefined) {
        const position = parseId(body.position);
        if (!position) return { error: "Position must be a positive integer." };
        data.position = position;
    }

    return { data };
}

function handleDatabaseError(error: unknown, res: Response) {
    const code = (error as { code?: string }).code;

    // unique (course_id, position)
    if (code === "23505") {
        res.status(409).json({
            message: "There is already a module in this position for this course.",
        });
        return true;
    }

    // foreign key (course or user removed in the meantime)
    if (code === "23503") {
        res.status(400).json({
            message: "Course or user not found.",
        });
        return true;
    }

    return false;
}

async function getModules(req: Request, res: Response) {
    let courseId: number | undefined;

    if (req.query.course_id !== undefined) {
        const id = parseId(req.query.course_id);

        if (!id) {
            res.status(400).json({
                message: "Invalid course ID.",
            });
            return;
        }

        courseId = id;
    }

    try {
        const modules = await ModuleRepository.findAll(courseId);

        res.status(200).json(modules);
    } catch (error) {
        console.error("Error listing modules: ", error);

        res.status(500).json({
            message: "Error listing modules.",
        });
    }
}

async function getModuleById(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);

    if (!id) {
        res.status(400).json({
            message: "Invalid module ID.",
        });
        return;
    }

    try {
        const module = await ModuleRepository.findById(id);

        if (!module) {
            res.status(404).json({
                message: "Module not found.",
            });
            return;
        }

        res.status(200).json(module);
    } catch (error) {
        console.error("Error fetching module: ", error);

        res.status(500).json({
            message: "Error fetching module.",
        });
    }
}

async function createModule(req: Request, res: Response) {
    const result = readBody(req.body ?? {}, false);

    if ("error" in result) {
        res.status(400).json({
            message: result.error,
        });
        return;
    }

    const data = result.data as ModuleInput;

    try {
        if (!(await ModuleRepository.courseExists(data.course_id))) {
            res.status(400).json({
                message: "Course not found.",
            });
            return;
        }

        if (!(await ModuleRepository.userExists(data.user_id))) {
            res.status(400).json({
                message: "User not found.",
            });
            return;
        }

        data.position ??= await ModuleRepository.findNextPosition(data.course_id);

        const module = await ModuleRepository.create(data);

        res.status(201).json(module);
    } catch (error) {
        if (handleDatabaseError(error, res)) return;

        console.error("Error creating module: ", error);

        res.status(500).json({
            message: "Error creating module.",
        });
    }
}

async function updateModule(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);

    if (!id) {
        res.status(400).json({
            message: "Invalid module ID.",
        });
        return;
    }

    const result = readBody(req.body ?? {}, true);

    if ("error" in result) {
        res.status(400).json({
            message: result.error,
        });
        return;
    }

    const data = result.data;

    if (Object.keys(data).length === 0) {
        res.status(400).json({
            message: "No fields to update.",
        });
        return;
    }

    try {
        const module = await ModuleRepository.findById(id);

        if (!module) {
            res.status(404).json({
                message: "Module not found.",
            });
            return;
        }

        if (data.course_id !== undefined && !(await ModuleRepository.courseExists(data.course_id))) {
            res.status(400).json({
                message: "Course not found.",
            });
            return;
        }

        if (data.user_id !== undefined && !(await ModuleRepository.userExists(data.user_id))) {
            res.status(400).json({
                message: "User not found.",
            });
            return;
        }

        const updated = await ModuleRepository.update(id, data);

        res.status(200).json(updated);
    } catch (error) {
        if (handleDatabaseError(error, res)) return;

        console.error("Error updating module: ", error);

        res.status(500).json({
            message: "Error updating module.",
        });
    }
}

async function deleteModule(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);

    if (!id) {
        res.status(400).json({
            message: "Invalid module ID.",
        });
        return;
    }

    try {
        const module = await ModuleRepository.findById(id);

        if (!module) {
            res.status(404).json({
                message: "Module not found.",
            });
            return;
        }

        // The contents of the module are removed by ON DELETE CASCADE
        await ModuleRepository.remove(id);

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting module: ", error);

        res.status(500).json({
            message: "Error deleting module.",
        });
    }
}

export default {
    getModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
};
