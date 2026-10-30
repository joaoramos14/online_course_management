import { Router } from "express";
import * as controller from "../controller/reportController.js";

const router = Router();

router.get("/users-most-courses", controller.getUsersWithMostCourses);       // SQL 01
router.get("/course-most-contents", controller.getCourseWithMostContents);    // SQL 02
router.get("/courses-totals", controller.getCoursesWithTotals);               // SQL 03
router.get("/contents-with-course", controller.getContentsWithCourseName);    // SQL 04
router.get("/content-2-viewers", controller.getUsersWhoWatchedContent2);      // SQL 05

export default router;
