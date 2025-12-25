import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
    }
}); 

const User = mongoose.model('users', UserSchema);

export { User };