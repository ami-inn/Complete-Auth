import express from "express";
import { registerationUser } from "../controllers/user.controller.js";


const userRouter = express.Router()

userRouter.post('/registration',registerationUser)

userRouter.post('/activate-user',)


export default userRouter