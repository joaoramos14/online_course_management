import type { Request, Response } from "express";
import ContentRepository from "../repository/ContentRepository.js";
import ModuleRepository from "../repository/ModuleRepository.js";
import { CONTENT_TYPES } from "../models/Content.js";
import type { ContentInput, ContentType } from "../models/Content.js";

function parseId(value: unknown) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

// Validates the request body. On update every field is optional,
// on create module_id, title and content are required.
function readBody(body: Record<string, unknown>, isUpdate: boolean) {
    const data: Partial<ContentInput> = {};

    if (!isUpdate || body.module_id !== undefined) {
        const moduleId = parseId(body.module_id);
        if (!moduleId) return { error: "Invalid module ID." };
        data.module_id = moduleId;
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

    if (!isUpdate || body.content !== undefined) {
        if (typeof body.content !== "string" || body.content.trim() === "") {
            return { error: "Content is required." };
        }
        data.content = body.content.trim();
    }

    if (body.content_type !== undefined) {
        if (!CONTENT_TYPES.includes(body.content_type as ContentType)) {
            return { error: `Content type must be one of: ${CONTENT_TYPES.join(", ")}.` };
        }
        data.content_type = body.content_type as ContentType;
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

    // unique (module_id, position)
    if (code === "23505") {
        res.status(409).json({
            message: "There is already a content in this position for this module.",
        });
        return true;
    }

    // foreign key (module removed in the meantime)
    if (code === "23503") {
        res.status(400).json({
            message: "Module not found.",
        });
        return true;
    }

    return false;
}

async function getContents(req: Request, res: Response) {
    let moduleId: number | undefined;

    if (req.query.module_id !== undefined) {
        const id = parseId(req.query.module_id);

        if (!id) {
            res.status(400).json({
                message: "Invalid module ID.",
            });
            return;
        }

        moduleId = id;
    }

    try {
        const contents = await ContentRepository.findAll(moduleId);

        res.status(200).json(contents);
    } catch (error) {
        console.error("Error listing contents: ", error);

        res.status(500).json({
            message: "Error listing contents.",
        });
    }
}

async function getContentById(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);

    if (!id) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    try {
        const content = await ContentRepository.findById(id);

        if (!content) {
            res.status(404).json({
                message: "Content not found.",
            });
            return;
        }

        res.status(200).json(content);
    } catch (error) {
        console.error("Error fetching content: ", error);

        res.status(500).json({
            message: "Error fetching content.",
        });
    }
}

async function createContent(req: Request, res: Response) {
    const result = readBody(req.body ?? {}, false);

    if ("error" in result) {
        res.status(400).json({
            message: result.error,
        });
        return;
    }

    const data = result.data as ContentInput;

    try {
        if (!(await ModuleRepository.findById(data.module_id))) {
            res.status(400).json({
                message: "Module not found.",
            });
            return;
        }

        data.position ??= await ContentRepository.findNextPosition(data.module_id);

        const content = await ContentRepository.create(data);

        res.status(201).json(content);
    } catch (error) {
        if (handleDatabaseError(error, res)) return;

        console.error("Error creating content: ", error);

        res.status(500).json({
            message: "Error creating content.",
        });
    }
}

async function updateContent(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);

    if (!id) {
        res.status(400).json({
            message: "Invalid content ID.",
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
        const content = await ContentRepository.findById(id);

        if (!content) {
            res.status(404).json({
                message: "Content not found.",
            });
            return;
        }

        if (data.module_id !== undefined && !(await ModuleRepository.findById(data.module_id))) {
            res.status(400).json({
                message: "Module not found.",
            });
            return;
        }

        const updated = await ContentRepository.update(id, data);

        res.status(200).json(updated);
    } catch (error) {
        if (handleDatabaseError(error, res)) return;

        console.error("Error updating content: ", error);

        res.status(500).json({
            message: "Error updating content.",
        });
    }
}

async function deleteContent(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);

    if (!id) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    try {
        const content = await ContentRepository.findById(id);

        if (!content) {
            res.status(404).json({
                message: "Content not found.",
            });
            return;
        }

        await ContentRepository.remove(id);

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting content: ", error);

        res.status(500).json({
            message: "Error deleting content.",
        });
    }
}

export default {
    getContents,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
};
