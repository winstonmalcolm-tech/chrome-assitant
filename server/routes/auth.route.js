import express from "express";
import authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();


router.post('/login', authController.login);
router.post('/signup', authController.register);
router.post('/verify', authController.verifyMagicLink);
router.post('/refresh', authController.refreshToken);
router.get('/me', authMiddleware, authController.getUser);


export default router;