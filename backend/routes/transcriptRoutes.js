import express from "express";
import { saveTranscript, getTranscripts, deleteTranscript } from "../controllers/transcriptController.js";

const router = express.Router();

router.post("/save", saveTranscript);
router.get("/", getTranscripts);
router.delete("/:id", deleteTranscript);

export default router;