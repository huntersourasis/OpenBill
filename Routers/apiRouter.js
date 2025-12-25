import express from 'express';

const apiRouter = express.Router();

apiRouter
    .get("/" , (req , res)=>{
        res.send("Under Development");
    });

export default apiRouter;