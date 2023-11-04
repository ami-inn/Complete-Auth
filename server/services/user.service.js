import userModel from "../models/user.model.js";
import{ redis }from '../utils/redis.js'


export const getUserById = async(id,res)=>{

    const userJson = await redis.get(id)

    console.log(userJson);

    if(userJson){
        const user = JSON.parse(userJson)
        res.status(200).json({
            success:true,
            user
        })
    }
}

export const getAllUsersService  = async(res)=>{
    const users = await userModel.find().sort({createdAt:-1})

    res.status(201).JSON({
        success:true,
        users
    })
}

export const updateUserRoleService = async(res,id,role)=>{
    const user = await userModel.findByIdAndUpdate(id,{role},{new:true})
    res.status(201).json({success:true,user})
}