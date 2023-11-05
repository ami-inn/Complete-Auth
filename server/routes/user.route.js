import express from "express";
import { activateUser, loginUser, logoutUser, registerationUser, updateAccessToken } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.js";


const userRouter = express.Router()

userRouter.post('/registration',registerationUser)

userRouter.post('/activate-user',activateUser)

userRouter.post('/login',loginUser)

userRouter.get('/logout',isAuthenticated,logoutUser)

userRouter.get('/refresh',updateAccessToken)


export default userRouter