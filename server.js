import express from 'express';
import ConnectDB from './DB/Mongo.js';
import mainRouter from './Routers/mainRouter.js';
import authRouter from './Routers/authRouter.js';
import pagesRouter from './Routers/pagesRouter.js';
import userRouter from './Routers/userRouter.js';
import settingsRouter from './Routers/settingsRouter.js';
import productsRouter from './Routers/productsRouter.js';
import customersRouter from './Routers/customersRouter.js';
import cookieParser from 'cookie-parser';

const server = express();
server.use(express.static('public'));
server.use(express.json());
server.use(cookieParser());
server.use("/" , mainRouter);
server.use("/auth" , authRouter );
server.use("/pages" , pagesRouter);
server.use("/api/users" , userRouter);
server.use("/api/settings" , settingsRouter);
server.use("/api/products" , productsRouter);
server.use("/api/customers" , customersRouter);

server.set("view engine" , "ejs");


server.listen(process.env.PORT , ()=>{
    ConnectDB();
    console.log(`NodeJS Server is running on  : http://127.0.0.1:${process.env.PORT}`);
})