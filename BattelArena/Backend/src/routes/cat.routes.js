import { Router } from "express";
import { getAllCats, getCatById, createCat, generateAICat } from "../controllers/catController.js";

const router = Router();

router.get("/", getAllCats);
router.get("/:id", getCatById);
router.post("/", createCat);
router.post("/generate-ai", generateAICat);

export default router;
