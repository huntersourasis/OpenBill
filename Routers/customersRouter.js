import express from 'express';
import { createCustomerController , readCustomerController , updateCustomerController , deleteCustomerController  , readOneCustomerController} from '../Controllers/customersController.js';


const customersRouter = express.Router();

customersRouter
    .post("/create" , createCustomerController )
    .post("/read" , readCustomerController )
    .post("/read-one" , readOneCustomerController )
    .post("/update" , updateCustomerController )
    .post("/delete" , deleteCustomerController );

export default customersRouter;