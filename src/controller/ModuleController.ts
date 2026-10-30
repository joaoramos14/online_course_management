import type { Request, Response } from "express";
import ModuleRepository from "../repository/ModuleRepository.js";
import type { ModuleInput } from "../models/Module.js";

function parseId(value: unknown) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function isValidTitle(title: unknown) {
    return typeof title === "string" && title.trim() !== "" && title.trim().length <= 150;
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
    const { title, description, position } = req.body ?? {};
    const courseId = parseId(req.body?.course_id);
    const userId = parseId(req.body?.user_id);

    if (!courseId) {
        res.status(400).json({
            message: "Invalid course ID.",
        });
        return;
    }

    if (!userId) {
        res.status(400).json({
            message: "Invalid user ID.",
        });
        return;
    }

    if (!isValidTitle(title)) {
        res.status(400).json({
            message: "Title is required and must have at most 150 characters.",
        });
        return;
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        res.status(400).json({
            message: "Description must be a text.",
        });
        return;
    }

    if (position !== undefined && !parseId(position)) {
        res.status(400).json({
            message: "Position must be a positive integer.",
        });
        return;
    }

    try {
        const courseExists = await ModuleRepository.courseExists(courseId);

        if (!courseExists) {
            res.status(400).json({
                message: "Course not found.",
            });
            return;
        }

        const userExists = await ModuleRepository.userExists(userId);

        if (!userExists) {
            res.status(400).json({
                message: "User not found.",
            });
            return;
        }

        const newModule: ModuleInput = {
            course_id: courseId,
            user_id: userId,
            title: title.trim(),
            description: description ?? null,
        };

        // Without a position the module goes to the end of the course
        if (position !== undefined) {
            newModule.position = Number(position);
        } else {
            newModule.position = await ModuleRepository.findNextPosition(courseId);
        }

        const module = await ModuleRepository.create(newModule);

        res.status(201).json(module);
    } catch (error) {
        console.error("Error creating module: ", error);

        res.status(500).json({
            message: "Error creating module.",
        });
    }
}

async function updateModule(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);
    const { course_id, user_id, title, description, position } = req.body ?? {};

    if (!id) {
        res.status(400).json({
            message: "Invalid module ID.",
        });
        return;
    }

    // Only the fields sent in the body are updated
    const changes: Partial<ModuleInput> = {};

    if (course_id !== undefined) {
        const courseId = parseId(course_id);

        if (!courseId) {
            res.status(400).json({
                message: "Invalid course ID.",
            });
            return;
        }

        changes.course_id = courseId;
    }

    if (user_id !== undefined) {
        const userId = parseId(user_id);

        if (!userId) {
            res.status(400).json({
                message: "Invalid user ID.",
            });
            return;
        }

        changes.user_id = userId;
    }

    if (title !== undefined) {
        if (!isValidTitle(title)) {
            res.status(400).json({
                message: "Title is required and must have at most 150 characters.",
            });
            return;
        }

        changes.title = title.trim();
    }

    if (description !== undefined) {
        if (description !== null && typeof description !== "string") {
            res.status(400).json({
                message: "Description must be a text.",
            });
            return;
        }

        changes.description = description;
    }

    if (position !== undefined) {
        if (!parseId(position)) {
            res.status(400).json({
                message: "Position must be a positive integer.",
            });
            return;
        }

        changes.position = Number(position);
    }

    if (Object.keys(changes).length === 0) {
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

        if (changes.course_id) {
            const courseExists = await ModuleRepository.courseExists(changes.course_id);

            if (!courseExists) {
                res.status(400).json({
                    message: "Course not found.",
                });
                return;
            }
        }

        if (changes.user_id) {
            const userExists = await ModuleRepository.userExists(changes.user_id);

            if (!userExists) {
                res.status(400).json({
                    message: "User not found.",
                });
                return;
            }
        }

        const updatedModule = await ModuleRepository.update(id, changes);

        res.status(200).json(updatedModule);
    } catch (error) {
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

        // The contents of the module are deleted too (ON DELETE CASCADE)
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
