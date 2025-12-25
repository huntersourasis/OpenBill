import bcrypt from 'bcrypt';
import {User} from "../Modals/userModal.js";
import jwt from 'jsonwebtoken';
const expiresIn = 3;
const loginController = async (req , res)=>{
    try 
    {
        const {email , password} = req.body;
        const isEmailExist = await User.findOne({email});
        if(!isEmailExist)
        {
            return res.status(401).json({
                success : false,
                msg : "Invalid Email"
            });
        }
        const isMatch = await bcrypt.compare(password , isEmailExist.password);
        if(isMatch)
        {
           const payload = {
                email : isEmailExist.email,
                role : isEmailExist.role
           };

           const secretKey = process.env.JWT_SECRET;

           const jwt_token = jwt.sign(payload , secretKey , {expiresIn : `${expiresIn}h`});
           
           res.cookie('token' , jwt_token , {
                httpOnly: true,  
                sameSite: 'strict', 
                maxAge: (3600000 * expiresIn)
           })

           return res.status(200).json({
            success : true,
            msg : "Login Successful",
            token : jwt_token,
            payload : payload
           });
        } else
        {
            return res.status(401).json({
                success : false,
                msg : "Incorrect Password",
            });
        }
    }
    catch (error) 
    {
        return res.status(500).json({
            success : false,
            msg : "Internal Server Error"
        })
    }
}

const logoutController = (req, res) => {
    try {
        const { isLoggedConfirm } = req.body;

        if (isLoggedConfirm) {
            res.clearCookie('token', {
                sameSite: 'strict'
            });

            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        }

        return res.status(400).json({
            success: false,
            msg: "Logout confirmation required"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Server Error during logout"
        });
    }
}

export {loginController , logoutController};