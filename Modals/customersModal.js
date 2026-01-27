import mongoose from "mongoose";

const customersSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ],
            index: true
        },

        primary_ph: {
            type: String,
            required: [true, "Primary phone number is required"],
            match: [
                /^[6-9]\d{9}$/,
                "Primary phone number must be a valid 10-digit Indian number"
            ]
        },

        secondary_ph: {
            type: String,
            match: [
                /^[6-9]\d{9}$/,
                "Secondary phone number must be a valid 10-digit Indian number"
            ]
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [10, "Address must be at least 10 characters"]
        },

        status: {
            type: Boolean,
            default: true
        },

        createdBy : {
            type : String,
            required : true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const customersModal = mongoose.model("customers" , customersSchema);

export default customersModal;