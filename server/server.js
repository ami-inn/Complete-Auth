import { app } from "./app.js";
import connectDB from "./utils/db.js";


app.listen(process.env.PORT,()=>{
    console.log(`server is connected with ${process.env.PORT}`);
    connectDB()
    
} )