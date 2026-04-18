import { productsModal } from "../Modals/productsModal.js";

export const releaseStockService = async (items, status) => {

    if (!["paid", "due"].includes(status)) return;

    for (const item of items) {
        const product = await productsModal.findById(item.product_id);

        if (!product) {
            throw new Error(`Product not found`);
        }

        if (product.stock < item.quantity) {
            throw new Error(
                `Insufficient stock for ${product.name}. Available: ${product.stock}`
            );
        }
    }

    for (const item of items) {
        await productsModal.updateOne(
            { _id: item.product_id },
            { $inc: { stock: -item.quantity } }
        );
    }
};