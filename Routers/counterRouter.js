import express from 'express';
import {generateInvoiceNumberController , loadInvoiceNumber} from '../Controllers/counterController.js';

const counterRouter = express.Router();

counterRouter
    .post("/load-invoice" , loadInvoiceNumber)
    .post("/update-invoice" , generateInvoiceNumberController);

export default counterRouter;