import express from "express";
import { chat } from "../Controller/ChatController.js";

const router = express.Router();

import authMiddleware from "../Middlewares/authMiddleware.js";

router.post("/", authMiddleware, chat);

export default router;
