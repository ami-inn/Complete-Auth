import ErrorHandler from "../utils/ErrorHandler.js"


export const ErrorMiddleware = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    if(err.name === "CastError"){
        const message = "Request Not Found Invalid Store Path"
        err = new ErrorHandler(message,400)
    }

    res.status(err.statusCode).json({
        success:false,
        message: err.message
    })

}