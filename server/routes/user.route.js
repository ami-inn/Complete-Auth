import express from "express";
import { activateUser, registerationUser } from "../controllers/user.controller.js";


const userRouter = express.Router()

userRouter.post('/registration',registerationUser)

userRouter.post('/activate-user',activateUser)


export default userRouter