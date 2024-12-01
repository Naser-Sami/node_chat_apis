import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

// register route
router.post("/register", (req, res) => {
  register(req, res);
});

//  login route
router.get("/login", (req, res) => {
  login(req, res);
});

export default router;
