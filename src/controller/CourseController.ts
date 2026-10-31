import type { Request, Response } from "express";
import courseRepository from "../repository/courseRepository.js";

// Returns true when the route param is a positive integer id.
function isValidId(id: string | undefined): id is string {
    return id !== undefined && /^[1-9]\d*$/.test(id);
}

// PGRST116 = no row found (".single()" returned nothing)
function isNotFound(error: unknown) {
    return (error as { code?: string }).code === "PGRST116";
}

async function getAll(req: Request, res: Response) {
    try {
        const courses = await courseRepository.findAll();

        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses: ", error);

        res.status(500).json({
            message: "Error fetching courses.",
        });
    }
}

async function getByKeyword(req: Request<{ keyword: string }>, res: Response) {
    const { keyword } = req.params;

    if (!keyword || typeof keyword != "string") {
        res.status(400).json({
            message: "Keyword not provided."
        });
        return;
    }

    try {
        const courses = await courseRepository.searchByKeyword(keyword);

        res.status(200).json(courses);
    } catch (error) {
        console.error("Error searching courses: ", error);

        res.status(500).json({
            message: "Error searching courses.",
        });
    }
}

async function getById(req: Request<{ courseId: string }>, res: Response) {
    const { courseId } = req.params;

    if (!isValidId(courseId)) {
        res.status(400).json({
            message: "Invalid course ID."
        });
        return;
    }

    try {
        const course = await courseRepository.findById(courseId);

        res.status(200).json(course);
    } catch (error) {
        console.error("Error fetching course: ", error);

        res.status(404).json({
            message: "Course not found.",
        });
    }
}

async function create(req: Request, res: Response) {
    const { code, title, description, user_id } = req.body;

    if (!code || typeof code != "string") {
        res.status(400).json({
            message: "Course code is required."
        });
        return;
    }

    if (!title || typeof title != "string") {
        res.status(400).json({
            message: "Course title is required."
        });
        return;
    }

    if (typeof user_id != "number") {
        res.status(400).json({
            message: "user_id is required and must be a number."
        });
        return;
    }

    try {
        const course = await courseRepository.create({
            code,
            title,
            description: description ?? null,
            user_id,
        });

        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating course: ", error);

        // 23505 = course code already exists
        if ((error as { code?: string }).code === "23505") {
            res.status(409).json({
                message: "A course with this code already exists.",
            });
            return;
        }

        // 23503 = user_id does not exist
        if ((error as { code?: string }).code === "23503") {
            res.status(400).json({
                message: "User not found for the given user_id.",
            });
            return;
        }

        res.status(500).json({
            message: "Error creating course.",
        });
    }
}

async function update(req: Request<{ courseId: string }>, res: Response) {
    const { courseId } = req.params;
    const { code, title, description, user_id } = req.body;

    if (!isValidId(courseId)) {
        res.status(400).json({
            message: "Invalid course ID."
        });
        return;
    }

    if (!code || typeof code != "string") {
        res.status(400).json({
            message: "Course code is required."
        });
        return;
    }

    if (!title || typeof title != "string") {
        res.status(400).json({
            message: "Course title is required."
        });
        return;
    }

    if (typeof user_id != "number") {
        res.status(400).json({
            message: "user_id is required and must be a number."
        });
        return;
    }

    try {
        const course = await courseRepository.update(courseId, {
            code,
            title,
            description: description ?? null,
            user_id,
        });

        res.status(200).json(course);
    } catch (error) {
        console.error("Error updating course: ", error);

        if (isNotFound(error)) {
            res.status(404).json({
                message: "Course not found.",
            });
            return;
        }

        // 23503 = user_id does not exist
        if ((error as { code?: string }).code === "23503") {
            res.status(400).json({
                message: "User not found for the given user_id.",
            });
            return;
        }

        if ((error as { code?: string }).code === "23505") {
            res.status(409).json({
                message: "A course with this code already exists.",
            });
            return;
        }

        res.status(500).json({
            message: "Error updating course.",
        });
    }
}

async function remove(req: Request<{ courseId: string }>, res: Response) {
    const { courseId } = req.params;

    if (!isValidId(courseId)) {
        res.status(400).json({
            message: "Invalid course ID."
        });
        return;
    }

    try {
        await courseRepository.remove(courseId);

        res.status(200).json({
            message: "Course removed successfully.",
        });
    } catch (error) {
        console.error("Error removing course: ", error);

        if (isNotFound(error)) {
            res.status(404).json({
                message: "Course not found.",
            });
            return;
        }

        // 23503 = course still has modules
        if ((error as { code?: string }).code === "23503") {
            res.status(409).json({
                message: "This course has modules. Remove the modules first.",
            });
            return;
        }

        res.status(500).json({
            message: "Error removing course.",
        });
    }
}

export default {
    getAll,
    getById,
    getByKeyword,
    create,
    update,
    remove
}
