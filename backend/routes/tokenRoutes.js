import express from "express";
import { generateToken } from "../controllers/tokenController.js";

const router = express.Router();

router.post("/generate-token", generateToken);

export default router;
