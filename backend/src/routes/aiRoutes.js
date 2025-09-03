import express from "express";
import { summarizeText } from "../controllers/aiController.js";

const router = express.Router();

router.post("/summarize", summarizeText);

export default router;
