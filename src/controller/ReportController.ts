import type { Request, Response } from "express";
import ReportRepository from "../repository/ReportRepository.js";

async function getUsersWithMostCourses(req: Request, res: Response) {
    try {
        const report = await ReportRepository.findUsersWithMostCourses();

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating users with most courses report: ", error);

        res.status(500).json({
            message: "Error generating report.",
        });
    }
}

async function getCourseWithMostContents(req: Request, res: Response) {
    try {
        const report = await ReportRepository.findCourseWithMostContents();

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating course with most contents report: ", error);

        res.status(500).json({
            message: "Error generating report.",
        });
    }
}

async function getCoursesWithTotals(req: Request, res: Response) {
    try {
        const report = await ReportRepository.findCoursesWithTotals();

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating courses totals report: ", error);

        res.status(500).json({
            message: "Error generating report.",
        });
    }
}

async function getContentsWithCourseName(req: Request, res: Response) {
    try {
        const report = await ReportRepository.findContentsWithCourseName();

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating contents with course report: ", error);

        res.status(500).json({
            message: "Error generating report.",
        });
    }
}

async function getUsersWhoWatchedContent2(req: Request, res: Response) {
    try {
        const report = await ReportRepository.findContentViewers(2);

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating content 2 viewers report: ", error);

        res.status(500).json({
            message: "Error generating report.",
        });
    }
}

async function getContentViewers(req: Request<{ contentId: string }>, res: Response) {
    const contentId = Number(req.params.contentId);

    if (!Number.isInteger(contentId) || contentId <= 0) {
        res.status(400).json({
            message: "Invalid content ID.",
        });
        return;
    }

    try {
        const report = await ReportRepository.findContentViewers(contentId);

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating content viewers report: ", error);

        res.status(500).json({
            message: "Error generating report.",
        });
    }
}

export default {
    getUsersWithMostCourses,
    getCourseWithMostContents,
    getCoursesWithTotals,
    getContentsWithCourseName,
    getUsersWhoWatchedContent2,
    getContentViewers,
};
