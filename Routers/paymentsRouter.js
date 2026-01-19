import { createPaymentController , readPaymentController , readOnePaymentController, updatePaymentController , deletePaymentController , cancelPaymentController, getInvoicesController , getAmountController} from "../Controllers/paymentsController.js";
import express from 'express';

const paymentsRouter = express.Router();

paymentsRouter
    .post("/create" , createPaymentController)
    .post("/read" , readPaymentController)
    .post("/read-one" , readOnePaymentController)
    .post("/update" , updatePaymentController)
    .post("/delete" , deletePaymentController)
    .post("/cancel" , cancelPaymentController)
    .post("/get-invoices" , getInvoicesController )
    .post("/get-amount" , getAmountController);

export default paymentsRouter;