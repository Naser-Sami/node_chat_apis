import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  checkOrCreateConversation,
  fetchAllConversationsByUserId,
} from "../controllers/conversationsController";

const router = Router();

router.get("/", verifyToken, fetchAllConversationsByUserId);
router.post("/check-or-create", verifyToken, checkOrCreateConversation);

export default router;
