import { Router } from "express";
import ContentController from "../controller/ContentController.js";

const router = Router();

router.get("/", ContentController.getContents);         // ?module_id= to filter by module
router.get("/:id", ContentController.getContentById);
router.post("/", ContentController.createContent);
router.put("/:id", ContentController.updateContent);
router.delete("/:id", ContentController.deleteContent);

export default router;
