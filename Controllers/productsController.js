import { sendHttpResponse } from "../Utils/httpResponse.js";
import { productsModal, categoryModal, skuModal } from "../Modals/productsModal.js";
import mongoose from "mongoose";
// CATEGORY CONTROLLERS

const createCategoryController = async (req, res) => {
    try {
        const { category } = req.body;

        if (!category) {
            return sendHttpResponse(res, 400, false, "Category is required");
        }

        const exists = await categoryModal.findOne({ category });
        if (exists) {
            return sendHttpResponse(res, 409, false, "Category already exists");
        }

        const newCategory = await categoryModal.create({ category });
        return sendHttpResponse(res, 201, true, "Category created successfully", newCategory);

    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const readCategoryController = async (req, res) => {
    try {
        const categories = await categoryModal.find().sort({ createdAt: -1 });
        return sendHttpResponse(res, 200, true, "Categories fetched successfully", categories);
    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const updateCategoryController = async (req, res) => {
    try {
        const { id, category } = req.body;

        if (!id) {
            return sendHttpResponse(res, 400, false, "Category ID is required");
        }

        if (!category) {
            return sendHttpResponse(res, 400, false, "Category is required");
        }

        const existingCategory = await categoryModal.findById(id);
        if (!existingCategory) {
            return sendHttpResponse(res, 404, false, "Category not found");
        }

        const oldCategory = existingCategory.category;

        const updatedCategory = await categoryModal.findByIdAndUpdate(
            id,
            { category },
            { new: true, runValidators: true }
        );

        await Promise.all([
            skuModal.updateMany(
                { category: oldCategory },
                { $set: { category } }
            ),
            productsModal.updateMany(
                { category: oldCategory },
                { $set: { category } }
            )
        ]);

        return sendHttpResponse(
            res,
            200,
            true,
            "Category updated successfully",
            updatedCategory
        );

    } catch (err) {
        console.error(err);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};


const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return sendHttpResponse(res, 400, false, "Category ID required");
        }

        const category = await categoryModal.findById(id);
        if (!category) {
            return sendHttpResponse(res, 404, false, "Category not found");
        }

        await skuModal.deleteMany({ category: category.category });
        await productsModal.deleteMany({ category: category.category });
        await categoryModal.findByIdAndDelete(id);

        return sendHttpResponse(res, 200, true, "Category deleted successfully");

    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};


// SKU CONTROLLERS


const createSKUController = async (req, res) => {
    try {
        const { category, sku_prefix } = req.body;

        if (!category || !sku_prefix) {
            return sendHttpResponse(res, 400, false, "Category and SKU prefix are required");
        }

        const isCategoryExist = await categoryModal.findOne({ category });
        if (!isCategoryExist) {
            return sendHttpResponse(res, 409, false, "Category does not exist");
        }

        const exists = await skuModal.findOne({category , sku_prefix });
        if (exists) {
            return sendHttpResponse(res, 409, false, "SKU prefix already exists");
        }

        const sku = await skuModal.create({ category, sku_prefix });
        return sendHttpResponse(res, 201, true, "SKU created successfully", sku);

    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const readSKUController = async (req, res) => {
    try {
        const skus = await skuModal.find().sort({ category: 1 });
        return sendHttpResponse(res, 200, true, "SKUs fetched successfully", skus);
    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const updateSKUController = async (req, res) => {
    try {
        const {id , sku_prefix } = req.body;

        const getsku = await skuModal.findById(id);

        const existingsku = getsku.sku_prefix;

        await productsModal.updateMany({sku : existingsku},{
            $set : {sku : sku_prefix}
        },{ new: true, runValidators: true });

        const updated = await skuModal.findByIdAndUpdate(
            id,
            { sku_prefix },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return sendHttpResponse(res, 404, false, "SKU not found");
        }

        return sendHttpResponse(res, 200, true, "SKU updated successfully", updated);

    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const deleteSKUController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return sendHttpResponse(res, 400, false, "SKU ID is required");
        }

        const existingSKU = await skuModal.findById(id);
        if (!existingSKU) {
            return sendHttpResponse(res, 404, false, "SKU not found");
        }

        const skuPrefix = existingSKU.sku_prefix;
        const category = existingSKU.category;

        await Promise.all([
            productsModal.deleteMany({ sku: skuPrefix , category : category }),
            skuModal.findByIdAndDelete(id)
        ]);

        return sendHttpResponse(res, 200, true, "SKU deleted successfully");

    } catch (err) {
        console.error(err);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};


// PRODUCT CONTROLLERS

const createProductController = async (req, res) => {
    try {
        const product = await productsModal.create(req.body);
        return sendHttpResponse(res, 201, true, "Product created successfully", product);

    } catch (err) {
        if (err.code === 11000) {
            return sendHttpResponse(res, 409, false, "SKU already exists");
        }
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const readProductController = async (req, res) => {
    try {
        const products = await productsModal.find().sort({ createdAt: -1 });
        return sendHttpResponse(res, 200, true, "Products fetched successfully", products);
    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const updateProductController = async (req, res) => {
    try {
        const { id } = req.body;

        const updated = await productsModal.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return sendHttpResponse(res, 404, false, "Product not found");
        }

        return sendHttpResponse(res, 200, true, "Product updated successfully", updated);

    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const deleteProductController = async (req, res) => {
    try {
        const { id } = req.body;

        const deleted = await productsModal.findByIdAndDelete(id);
        if (!deleted) {
            return sendHttpResponse(res, 404, false, "Product not found");
        }

        return sendHttpResponse(res, 200, true, "Product deleted successfully");

    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};

const readOneProductController = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return sendHttpResponse(res, 400, false, "Product ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendHttpResponse(res, 400, false, "Invalid Product ID");
    }

    try {
        const product = await productsModal.findOne({ _id: id });

        if (!product) {
            return sendHttpResponse(res, 404, false, "Product not found");
        }

        return sendHttpResponse(
            res,
            200,
            true,
            "Product fetched successfully",
            product
        );
    } catch (err) {
        return sendHttpResponse(res, 500, false, err.message);
    }
};
export {
    createProductController,
    readProductController,
    readOneProductController,
    updateProductController,
    deleteProductController,
    createCategoryController,
    readCategoryController,
    updateCategoryController,
    deleteCategoryController,
    createSKUController,
    readSKUController,
    updateSKUController,
    deleteSKUController
};
