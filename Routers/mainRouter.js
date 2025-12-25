import express from 'express';
import {loginController , forgotPasswordController} from '../Controllers/mainController.js';


const mainRouter = express.Router();

mainRouter
    .get("/" , loginController)
    .get("/forgot-password" , forgotPasswordController);

export default mainRouter;