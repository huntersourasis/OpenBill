import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    section: {
        type: String,
        enum: [
            "companysettings",
            "billandtax",
            "userandrole",
            "security",
            "system"
        ],
        required: true
    },

    // Company
    com_name: String,
    business_email: String,
    ph_number: String,
    gst_number: String,
    address: String,

    // Billing
    default_tax: Number,
    invoice_prefix: String,
    currency: String,
    automatic_invoice_numbering: Boolean,

    // User & Role
    role: String,
    max_login_attempts: Number,

    // Security
    session_timeout: Number,

    // System
    time_zone: String
}, { timestamps: true });

SettingsSchema.index({ section: 1 }, { unique: true });

export default mongoose.model("settings", SettingsSchema);
