import express from 'express';
import ConnectDB from './DB/Mongo.js';
import mainRouter from './Routers/mainRouter.js';
import authRouter from './Routers/authRouter.js';
import pagesRouter from './Routers/pagesRouter.js';
import userRouter from './Routers/userRouter.js';
import settingsRouter from './Routers/settingsRouter.js';
import productsRouter from './Routers/productsRouter.js';
import customersRouter from './Routers/customersRouter.js';
import invoicesRouter from './Routers/invoicesRouter.js';
import counterRouter from './Routers/counterRouter.js';
import paymentsRouter from './Routers/paymentsRouter.js';
import homeRouter from './Routers/homeRouter.js';
import reportRouter from './Routers/reportRouter.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const server = express();
server.use(express.static('public'));
server.use(express.json());
server.use(cookieParser());
server.use(cors({
  origin: true,        
  credentials: true
}));

server.use("/" , mainRouter);
server.use("/auth" , authRouter );
server.use("/pages" , pagesRouter);
server.use("/api/users" , userRouter);
server.use("/api/settings" , settingsRouter);
server.use("/api/products" , productsRouter);
server.use("/api/customers" , customersRouter);
server.use("/api/invoices" , invoicesRouter);
server.use("/api/counter" , counterRouter);
server.use("/api/payments" , paymentsRouter);
server.use("/api/home" , homeRouter);
server.use("/api/report" , reportRouter);

server.set("view engine" , "ejs");


server.listen(process.env.PORT , ()=>{
    ConnectDB();
    console.log(`NodeJS Server is running on  : http://127.0.0.1:${process.env.PORT}`);
})