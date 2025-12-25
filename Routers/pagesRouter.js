import express from 'express';
import {homeController , invoiceController , customersController , usersController , paymentsController , settingsController , productsController , reportsController} from '../Controllers/pagesController.js';

const pagesRouter = express.Router();

pagesRouter
    .get("/home" , homeController)
    .get("/invoice" , invoiceController)
    .get("/customers" , customersController)
    .get("/products" , productsController)
    .get("/payments" , paymentsController)
    .get("/reports" , reportsController)
    .get("/users" , usersController )
    .get("/settings" , settingsController);

export default pagesRouter;