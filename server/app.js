import express from 'express';
export const app = express();
import cors from 'cors';
import cookiParser from 'cookie-parser'
import dotenv from 'dotenv'
import { ErrorMiddleware } from './middleware/error.js';
dotenv.config()



app.use(express.json({ limit: "50mb" }));

app.use(cookiParser())

app.get("/test", (req,res, next) => {
    res.status(200).json({
      success: true,
      message: "api is working",
    });
  });


app.all('*',(req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`)
    next(err)
})

app.use(ErrorMiddleware)