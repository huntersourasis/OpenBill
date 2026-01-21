import jwt from 'jsonwebtoken';
import loadSettings from '../Utils/loadSettings.js';

const protect = async (req, res, page) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.render("error/Error", {
                cooldown : 5000 ,
                code : 401 ,
                msg : "Unauthorized Access" ,
                content : "You do not have permission to view this page."              
            });
        }
        const settings = await loadSettings();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        return res.render(`pages/${page}`, {
            payload: decoded ,
            navLink : page,
            settings : settings
        });

    } catch (error) {
        return res.render("error/Error" , {
            cooldown : 5000 ,
            code : 401,
            msg : "Unauthorized Access" ,
            content : "You do not have permission to view this page."   
        });
    }
};

const homeController = (req , res) =>{
    return protect(req , res , "home");
}
const invoiceController = (req , res) =>{
    return protect(req , res , "invoices");
}
const customersController = (req , res) =>{
    return protect(req , res , "customers");
}
const productsController = (req , res) =>{
    return protect(req , res , "products");
}
const paymentsController = (req , res) =>{
    return protect(req , res , "payments");
}
const usersController = (req , res) =>{
    return protect(req , res , "users");
}
const reportsController = (req , res) =>{
    return protect(req , res , "reports");
}
const settingsController = (req , res) =>{
    return protect(req , res , "settings");
}

export {homeController , invoiceController , customersController , usersController , paymentsController , settingsController , productsController , reportsController};