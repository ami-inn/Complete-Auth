import userModel from "../models/user.model.js";
import ErrorHandler from '../utils/ErrorHandler.js'
import {catchAsyncError} from '../middleware/catchAsyncError.js'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()
import { fileURLToPath } from 'url';
import {dirname} from 'path'
import path from 'path'
import { redis } from "../utils/redis.js";
import ejs from 'ejs'
import sendMail from "../utils/sendMail.js";
import{ sendToken,accessTokenOptions,refreshTokenOptions} from '../utils/jwt.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);




export const registerationUser = catchAsyncError(async(req,res,next)=>{
    try {
        
        const {name,email,password}= req.body

        // console.log('enter heree',req.body);

        const isMailExists = await userModel.findOne({email})

        if(isMailExists){
            return next(new ErrorHandler("user already exists",400))
        }

        const user={
            name,email,password
        }

        const activationToken = createActivationToken(user)

        const activationCode = activationToken.activationCode

        const data = {user:{name:user.name},activationCode}

        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-email.ejs"), data);


        try{

            console.log('enterrrrrrrrrrrrrrrr');

            await sendMail({
                email:user.email,
                subject:'Activate Your Account',
                template:'activation-email.ejs',
                data
            })

            res.status(200).json({
                success:true,
                message:`please check your email ${user.email} to activate your account`,
                activationToken:activationToken.token
            })

        }
        catch(error){
            return next(new ErrorHandler(error.message,400))
        }

    } catch (error) {
        return next(new ErrorHandler(error.message,400))
    }
})


export const createActivationToken = (user)=>{
    // token and activationCode

    console.log(user);

    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const token = jwt.sign({
        user,activationCode
    },process.env.ACTIVATION_SECRET, {expiresIn:"5m"})

    return {token,activationCode}
}

export const activateUser = catchAsyncError(async(req,res,next)=>{
    try {

        const {activation_token,activation_code} = req.body

        

        console.log(req.body);

        const newUser = jwt.verify(activation_token,process.env.ACTIVATION_SECRET)

        console.log(activation_code,newUser.activationCode);

        console.log('new user',newUser.activationCode === activation_code);

        if(newUser.activationCode !== activation_code){
            return next(new ErrorHandler('invalid activation code',404))
        }

        const {name,email,password} = newUser.user

        const existUser = await userModel.findOne({email})

        if(existUser){
            return next(new ErrorHandler('user already exists',400))
        }

        console.log('------');

        const user = await userModel.create({
            name,
            email,
            password
        })

        console.log(user);
        

        res.status(201).json({
            success:true,
        })
        
        
    } catch (error) {
        return next(new Error(error.message,404));
    }
})



export const loginUser = catchAsyncError(async(req,res,next)=>{
    try {

        const {email,password} = req.body

        if(!email || !password) {
            return next(new ErrorHandler('please input email and passsword',400))
        }

        const user = await userModel.findOne({email}).select("+password")

        if(!user){
            return next(new ErrorHandler("invalid email or password",400))
        }

        const isPasswordMatch = await user.comparePassword(password)

        if(!isPasswordMatch){
            return next(new ErrorHandler('invalid email or password',400))
        }

        sendToken(user,200,res)
        
    } catch (error) {
        return next(new ErrorHandler(error.message,404))
    }
})


export const logoutUser = catchAsyncError(async(req,res,next)=>{
    try {
        console.log('enter heree');
        
        res.cookie("access_token","",{maxAge:1}) // when logout we are setting the access token and the refresh token to empty
        res.cookie("refresh_token","",{maxAge:1})

        const userId = req.user?._id ||""

        redis.del(userId)

        res.status(200).json({
            succes:true,
            message:'logout successfully'
        })
        
    } catch (error) {
        return next(new ErrorHandler(error.message,404))
    }
})

export const updateAccessToken = catchAsyncError(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
        const message = "Could not refresh token";

        if (!decoded) {
            return next(new ErrorHandler(message, 400));
        }

        const session = await redis.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler("please login to access this resources", 400));
        }

        const user = JSON.parse(session);

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "5m" });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "3d" });

        req.user = user;
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        await redis.set(user._id, JSON.stringify(user), "EX", 604800);
        res.status(200).json({
            status: "success",
            accessToken,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 404));
    }
});
