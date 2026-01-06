import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
    product_id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 } 
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    inv_number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    inv_date: { type: Date, required: true, default: Date.now },
    due_date: { type: Date, required: true },

    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customers", 
        required: true
    },

    items: {
        type: [invoiceItemSchema],
        required: true,
        validate: v => v.length > 0
    },

    subtotal: { type: Number, required: true, min: 0 },
    tax_percent: { type: Number, default: 0, min: 0 },
    tax_amount: { type: Number, default: 0, min: 0 },
    total_amount: { type: Number, required: true, min: 0 },

    status: {
        type: String,
        enum: ["pending", "paid", "overdue", "cancelled"],
        default: "pending",
        index: true
    },

    payment_date: { type: Date },
    notes: { type: String, trim: true },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }
}, { timestamps: true });

invoiceSchema.pre("save", function () {
    if (this.payment_status === "pending" && this.due_date < new Date()) {
        this.payment_status = "overdue";
    }

    this.subtotal = this.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    this.tax_amount = this.subtotal * (this.tax_percent / 100);
    this.total_amount = this.subtotal + this.tax_amount;

});

const invoiceModal = mongoose.model("invoices", invoiceSchema);
export default invoiceModal;