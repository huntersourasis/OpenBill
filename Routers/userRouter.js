import express from 'express';
import { createUserController , readUserController , updateUserController , deleteUserController , userStatusController } from '../Controllers/usersController.js'; 
const userRouter = express.Router();

userRouter
    .post("/create" , createUserController)
    .post("/update" , updateUserController)
    .post("/read" , readUserController)
    .post("/delete" , deleteUserController)
    .post("/update-status" , userStatusController);

export default userRouter;