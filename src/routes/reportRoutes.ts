import { Router } from "express";
import ReportController from "../controller/ReportController.js";

const router = Router();

router.get("/users-most-courses", ReportController.getUsersWithMostCourses);       // SQL 01
router.get("/course-most-contents", ReportController.getCourseWithMostContents);    // SQL 02
router.get("/courses-totals", ReportController.getCoursesWithTotals);               // SQL 03
router.get("/contents-with-course", ReportController.getContentsWithCourseName);    // SQL 04
router.get("/content-2-viewers", ReportController.getUsersWhoWatchedContent2);      // SQL 05
router.get("/content-viewers/:contentId", ReportController.getContentViewers);     // SQL 05 for any content

export default router;
