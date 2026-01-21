import express from 'express';
import { filterController} from '../Controllers/reportController.js';

const reportRouter = express.Router();

reportRouter
    .post("/filter" , filterController);

export default reportRouter;