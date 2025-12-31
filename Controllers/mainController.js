import jwt from 'jsonwebtoken';

const loginController = (req , res)=>{
    const token = req.cookies?.token;
    if(token)
    {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect("/pages/home");
        } catch (error) {
            return res.status(500).json({
                success : false,
                msg : "Internal Server Error"
            })
        }

    }
    return res.render("auth/login" , {
        avaterURL : "/svgs/work-from-home.svg" 
    });
}

const forgotPasswordController = (req , res)=>{
    return res.render("auth/forgot-password");
}

export {loginController , forgotPasswordController};