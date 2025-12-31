import express from 'express';
import { settingsReadController , settingsUpdateController } from '../Controllers/settingsController.js';

const settingsRouter = express.Router();

settingsRouter
    .get("/read" , settingsReadController)
    .put("/update" , settingsUpdateController);

export default settingsRouter;