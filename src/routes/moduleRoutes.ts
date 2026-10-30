import { Router } from "express";
import ModuleController from "../controller/ModuleController.js";

const router = Router();

router.get("/", ModuleController.getModules);           // ?course_id= to filter by course
router.get("/:id", ModuleController.getModuleById);
router.post("/", ModuleController.createModule);
router.put("/:id", ModuleController.updateModule);
router.delete("/:id", ModuleController.deleteModule);

export default router;
