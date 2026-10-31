import type { Request, Response } from "express";
import ContentRepository from "../repository/ContentRepository.js";
import ModuleRepository from "../repository/ModuleRepository.js";
import type { ContentInput } from "../models/Content.js";

const contentTypes = ["video", "article", "quiz"];

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

function isValidText(text: unknown) {
    return typeof text === "string" && text.trim() !== "";
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
    const { title, content, content_type, position } = req.body ?? {};
    const moduleId = parseId(req.body?.module_id);

    if (!moduleId) {
        res.status(400).json({
            message: "Invalid module ID.",
        });
        return;
    }

    if (!isValidTitle(title)) {
        res.status(400).json({
            message: "Title is required and must have at most 150 characters.",
        });
        return;
    }

    if (!isValidText(content)) {
        res.status(400).json({
            message: "Content is required.",
        });
        return;
    }

    if (content_type !== undefined && !contentTypes.includes(content_type)) {
        res.status(400).json({
            message: "Content type must be video, article or quiz.",
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
        const module = await ModuleRepository.findById(moduleId);

        if (!module) {
            res.status(400).json({
                message: "Module not found.",
            });
            return;
        }

        const newContent: ContentInput = {
            module_id: moduleId,
            title: title.trim(),
            content: content.trim(),
        };

        if (content_type !== undefined) {
            newContent.content_type = content_type;
        }

        // Without a position the content goes to the end of the module
        if (position !== undefined) {
            newContent.position = Number(position);
        } else {
            newContent.position = await ContentRepository.findNextPosition(moduleId);
        }

        const createdContent = await ContentRepository.create(newContent);

        res.status(201).json(createdContent);
    } catch (error) {
        console.error("Error creating content: ", error);

        res.status(500).json({
            message: "Error creating content.",
        });
    }
}

async function updateContent(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);
    const { module_id, title, content, content_type, position } = req.body ?? {};

    if (!id) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    // Only the fields sent in the body are updated
    const changes: Partial<ContentInput> = {};

    if (module_id !== undefined) {
        const moduleId = parseId(module_id);

        if (!moduleId) {
            res.status(400).json({
                message: "Invalid module ID.",
            });
            return;
        }

        changes.module_id = moduleId;
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

    if (content !== undefined) {
        if (!isValidText(content)) {
            res.status(400).json({
                message: "Content is required.",
            });
            return;
        }

        changes.content = content.trim();
    }

    if (content_type !== undefined) {
        if (!contentTypes.includes(content_type)) {
            res.status(400).json({
                message: "Content type must be video, article or quiz.",
            });
            return;
        }

        changes.content_type = content_type;
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
        const existingContent = await ContentRepository.findById(id);

        if (!existingContent) {
            res.status(404).json({
                message: "Content not found.",
            });
            return;
        }

        if (changes.module_id) {
            const module = await ModuleRepository.findById(changes.module_id);

            if (!module) {
                res.status(400).json({
                    message: "Module not found.",
                });
                return;
            }
        }

        const updatedContent = await ContentRepository.update(id, changes);

        res.status(200).json(updatedContent);
    } catch (error) {
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
