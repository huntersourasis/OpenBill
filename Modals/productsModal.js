import mongoose, { mongo } from "mongoose";

const productsSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },

    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    tax : {
        type : Number
    },
    warrantyMonths: {
        type: Number,
        default: 12,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    description: {
        type: String,
        trim: true,
        maxlength: 5000
    },

    createdBy: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

const categorySchema = new mongoose.Schema({
    category : {
        type : String,
        require : true
    }
},
{
    timestamps : true
})

const skuSchema = new mongoose.Schema({
    category : {
        type : String,
        require: true
    },
    sku_prefix : {
        type : String,
        require : true
    }
})

const productsModal = mongoose.model("products", productsSchema);
const categoryModal = mongoose.model("categories" , categorySchema);
const skuModal = mongoose.model("skus" , skuSchema);

export {productsModal , categoryModal , skuModal};
