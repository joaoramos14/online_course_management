import { Router } from "express";
import ContentController from "../controller/ContentController.js";
import ContentViewController from "../controller/ContentViewController.js";

const router = Router();

router.get("/", ContentController.getContents);         // ?module_id= to filter by module
router.get("/:id", ContentController.getContentById);
router.post("/", ContentController.createContent);
router.put("/:id", ContentController.updateContent);
router.delete("/:id", ContentController.deleteContent);

// Users who watched the content
router.get("/:id/views", ContentViewController.getViews);
router.post("/:id/views", ContentViewController.markAsViewed);
router.delete("/:id/views/:userId", ContentViewController.unmarkView);

export default router;
