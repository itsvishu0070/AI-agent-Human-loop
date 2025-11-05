import express from "express";
import {
  createHelpRequest,
  getHelpRequests,
  submitSupervisorAnswer,
} from "../controllers/requestController.js";

const router = express.Router();


router.post("/create", createHelpRequest);


router.get("/", getHelpRequests);


router.post("/:id/answer", submitSupervisorAnswer);

export default router;
