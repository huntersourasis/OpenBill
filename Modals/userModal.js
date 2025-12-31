import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullname : {
        type : String,
        require : true,
        default : "Openbill User"
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true,
        default: 'user'
    },
    status : {
        type : Boolean,
        default : true
    },
    lastlogin : {
        type : String
    },
    maxLoginAttempts : {
        type : Number,
        default : 0
    } 
}); 

const User = mongoose.model('users', UserSchema);

export { User };