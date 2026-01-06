import bcrypt from 'bcrypt';
import {User} from "../Modals/userModal.js";
import getCurrentDate from '../Utils/currentDate.js';
import { sendHttpResponse } from '../Utils/httpResponse.js';
import loadSettings from '../Utils/loadSettings.js';
import jwt from 'jsonwebtoken';
const loginController = async (req , res)=>{
    try 
    {
        const {email , password} = req.body;
        const isEmailExist = await User.findOne({email});
        if(!isEmailExist)
        {
            return sendHttpResponse(res , 401 , false , "Invalid Email");
        }
        const status = isEmailExist.status;
        if(!status)
        {
            return sendHttpResponse(res , 401 , false , "This user is currently deactivated");
        }
        const settings = await loadSettings();
        const expiresIn = settings.sessionTimeout;
        const maxLoginAttempts = isEmailExist?.maxLoginAttempts ?? 0;
        if(maxLoginAttempts >= settings.maxLoginAttempts)
        {
            isEmailExist.status = false;
            await isEmailExist.save();
            return sendHttpResponse(res , 401 , false , "Maximum login attempts reached");
        }
        const isMatch = await bcrypt.compare(password , isEmailExist.password);
        if(isMatch)
        {
           const payload = {
                id : isEmailExist._id,
                fullname : isEmailExist.fullname,
                email : isEmailExist.email,
                role : isEmailExist.role
           };

           isEmailExist.lastlogin = getCurrentDate();
           isEmailExist.maxLoginAttempts = 0;
           await isEmailExist.save();


           const secretKey = process.env.JWT_SECRET;

           const jwt_token = jwt.sign(payload , secretKey , {expiresIn : `${expiresIn}m`});
           
           res.cookie('token' , jwt_token , {
                httpOnly: true,  
                sameSite: 'strict', 
                maxAge: (3600000 * expiresIn)
           })
           return sendHttpResponse(res , 200 , true , "Login Successful");
        } else
        {
           isEmailExist.maxLoginAttempts = isEmailExist.maxLoginAttempts + 1;
           await isEmailExist.save(); 
           return sendHttpResponse(res , 401 , false , "Incorrect Password");
        }
    }
    catch (error) 
    {
        return sendHttpResponse(res , 500 , false , "Internal Server Error");
    }
}

const logoutController = (req, res) => {
    try {
        const { isLoggedConfirm } = req.body;

        if (isLoggedConfirm) {
            res.clearCookie('token', {
                sameSite: 'strict'
            });
            return sendHttpResponse(res , 200 , true , "Logged out successfully");
        }
        return sendHttpResponse(res , 401 , false , "Logout confirmation required");

    } catch (error) {
        return sendHttpResponse(res , 500 , false , "Internal Server Error");
    }
}

export {loginController , logoutController};