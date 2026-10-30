import type { Request, Response } from "express";
import reportRepository from "../repository/reportRepository.js";

// Wraps a repository function with the standard try/catch + 200/500 handling.
function handle(query: () => Promise<unknown[]>) {
    return async (_req: Request, res: Response) => {
        try {
            res.status(200).json(await query());
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error generating report" });
        }
    };
}

export const getUsersWithMostCourses = handle(reportRepository.usersWithMostCourses);
export const getCourseWithMostContents = handle(reportRepository.courseWithMostContents);
export const getCoursesWithTotals = handle(reportRepository.coursesWithTotals);
export const getContentsWithCourseName = handle(reportRepository.contentsWithCourseName);
export const getUsersWhoWatchedContent2 = handle(reportRepository.usersWhoWatchedContent2);
