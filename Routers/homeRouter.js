import express from 'express';
import { invoiceController , customerController , revenueController, productController  } from '../Controllers/homeController.js';

const homeRouter = express.Router();

homeRouter
    .post("/invoice" , invoiceController)
    .post("/customer" , customerController)
    .post("/revenue" , revenueController)
    .post("/product" , productController);

export default homeRouter;