import multer from "multer";
const upload = multer({ dest: "uploads/" });
import controllers from "../controllers/aiController.js";
import express from "express";
const router = express.Router();

router.post("/generate-variation", upload.single("image"), controllers.generateVariation);
router.post('/gpt-edit', upload.array('image'), controllers.editGptImage);
router.post('/dalle-edit', controllers.editDallE3);

export default router;
