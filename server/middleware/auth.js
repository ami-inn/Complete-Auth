import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from 'jsonwebtoken'
import { redis } from "../utils/redis.js";


export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
        // not logged in
        return next(new ErrorHandler("please login to access this resource ", 400));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN) || null;

    console.log(decoded);

    if (!decoded) {
        // token not valid
        return next(new ErrorHandler("access token is not valid ", 400));
    }

    const user = await redis.get(decoded.id);

    if (!user) {
        return next(new ErrorHandler("please login to access the resource", 400));
    }

    req.user = JSON.parse(user);
    next();
});
