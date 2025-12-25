import express from 'express';
import { loginController , logoutController } from '../Controllers/authController.js';
const authRouter = express.Router();

authRouter
    .post("/login" , loginController)
    .post("/logout" , logoutController);

export default authRouter;