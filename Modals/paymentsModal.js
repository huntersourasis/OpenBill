import mongoose from "mongoose";

const paymentsSchema = new mongoose.Schema({
    customer_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "customers",
        required : true 
    },
    invoice_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "invoices"
    },
    amount : {
        type : Number,
        required : true,
        min : 0
    },
    due_amount : {
        type : Number,
        required : true,
        default : 0,
        min : 0
    }
    ,
    payment_mode : {
        type : String,
        enum : ["cash" , "UPI" , "card" , "BT"],
        default : "cash",
        index : true
    },
    payment_date : {
        type : Date,
        default : new Date()
    },
    status : { 
        type : String,
        enum : ["pending" , "completed" , "canceled"]
    }   
    ,
    notes : {
        type : String,
        default : "Payment Note"
    }
});

const paymentsModal = mongoose.model("payments" , paymentsSchema);

export default paymentsModal;