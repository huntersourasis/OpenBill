import jwt from 'jsonwebtoken';

const protect = (req, res, page) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.render("error/401-Unauthorized", {
                cooldown : 5000
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return res.render(`pages/${page}`, {
            payload: decoded ,
            navLink : page
        });

    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.render("error/401-Unauthorized" , {
            cooldown : 5000
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