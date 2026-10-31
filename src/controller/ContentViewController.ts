import type { Request, Response } from "express";
import ContentViewRepository from "../repository/ContentViewRepository.js";
import ContentRepository from "../repository/ContentRepository.js";
import ModuleRepository from "../repository/ModuleRepository.js";

function parseId(value: unknown) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

async function getViews(req: Request<{ id: string }>, res: Response) {
    const contentId = parseId(req.params.id);

    if (!contentId) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    try {
        const content = await ContentRepository.findById(contentId);

        if (!content) {
            res.status(404).json({
                message: "Content not found.",
            });
            return;
        }

        const views = await ContentViewRepository.findByContent(contentId);

        res.status(200).json(views);
    } catch (error) {
        console.error("Error listing content views: ", error);

        res.status(500).json({
            message: "Error listing content views.",
        });
    }
}

async function markAsViewed(req: Request<{ id: string }>, res: Response) {
    const contentId = parseId(req.params.id);
    const userId = parseId(req.body?.user_id);

    if (!contentId) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    if (!userId) {
        res.status(400).json({
            message: "Invalid user ID.",
        });
        return;
    }

    try {
        const content = await ContentRepository.findById(contentId);

        if (!content) {
            res.status(404).json({
                message: "Content not found.",
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

        const alreadyViewed = await ContentViewRepository.findOne(contentId, userId);

        if (alreadyViewed) {
            res.status(409).json({
                message: "User already watched this content.",
            });
            return;
        }

        const view = await ContentViewRepository.create(contentId, userId);

        res.status(201).json(view);
    } catch (error) {
        console.error("Error marking content as viewed: ", error);

        res.status(500).json({
            message: "Error marking content as viewed.",
        });
    }
}

async function unmarkView(req: Request<{ id: string; userId: string }>, res: Response) {
    const contentId = parseId(req.params.id);
    const userId = parseId(req.params.userId);

    if (!contentId) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    if (!userId) {
        res.status(400).json({
            message: "Invalid user ID.",
        });
        return;
    }

    try {
        const view = await ContentViewRepository.findOne(contentId, userId);

        if (!view) {
            res.status(404).json({
                message: "View not found.",
            });
            return;
        }

        await ContentViewRepository.remove(contentId, userId);

        res.status(204).send();
    } catch (error) {
        console.error("Error removing content view: ", error);

        res.status(500).json({
            message: "Error removing content view.",
        });
    }
}

export default {
    getViews,
    markAsViewed,
    unmarkView,
};
