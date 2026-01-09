import express from 'express';
import { createInvoiceController , readInvoiceController , readOneInvoiceController , updateInvoiceController , deleteInvoiceController , viewInvoiceController} from '../Controllers/invoicesController.js';
const invoicesRouter = express.Router();

invoicesRouter
    .post("/create" , createInvoiceController)
    .post("/read" , readInvoiceController)
    .post("/read-one" , readOneInvoiceController)
    .post("/update" , updateInvoiceController)
    .post("/delete" , deleteInvoiceController)
    .get("/view" , viewInvoiceController);

export default invoicesRouter;