import express from 'express';
export const app = express();
import cors from 'cors';
import cookiParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()



app.use(express.json({ limit: "50mb" }));

app.use(cookiParser())

app.get("/test", (req,res, next) => {
    res.status(200).json({
      success: true,
      message: "api is working",
    });
  });