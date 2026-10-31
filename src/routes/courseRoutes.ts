import { Router } from "express";
import CourseController from "../controller/CourseController.js";

const router = Router();

router.get("/", CourseController.getAll);
router.get("/search/:keyword", CourseController.getByKeyword);
router.get("/:courseId", CourseController.getById);
router.post("/", CourseController.create);
router.put("/:courseId", CourseController.update);
router.delete("/:courseId", CourseController.remove);

export default router;
