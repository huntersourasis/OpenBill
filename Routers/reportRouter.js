import express from 'express';
import { exportReportController, filterController} from '../Controllers/reportController.js';

const reportRouter = express.Router();

reportRouter
    .post("/filter" , filterController)
    .post("/export" , exportReportController);

export default reportRouter;