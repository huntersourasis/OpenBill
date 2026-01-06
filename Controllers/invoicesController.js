import invoiceModel from "../Modals/invoicesModal.js";

const createInvoiceController = async (req, res) => {
    try {
        const {
            inv_number,
            inv_date,
            due_date,
            customer_id, 
            status,      
            items,
            tax_percent = 0,
            notes,
            created_by
        } = req.body;

        if (!inv_number || !customer_id || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let subtotal = 0;
        const processedItems = items.map(item => {
            const lineTotal = Number(item.quantity) * Number(item.rate);
            subtotal += lineTotal;
            return {
                product_id: item.product_id,
                name: item.name,
                quantity: Number(item.quantity),
                rate: Number(item.rate),
                amount: lineTotal
            };
        });

        const tax_amount = (subtotal * Number(tax_percent)) / 100;
        const total_amount = subtotal + tax_amount;


        const newInvoice = await invoiceModel.create({
            inv_number,
            inv_date: inv_date || new Date(),
            due_date,
            customer_id,       
            payment_status: status || "pending",
            items: processedItems,
            subtotal,
            tax_percent,
            tax_amount,
            total_amount,
            notes,
            created_by 
        });

        res.status(201).json({
            success: true,
            message: "Invoice saved successfully",
            data: newInvoice
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const readInvoiceController = async (req, res) => {
    try {
        const invoices = await invoiceModel
            .find()
            .populate("customer_id", "name") 
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


const readOneInvoiceController = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await invoiceModel.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: invoice
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updateInvoiceController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.items?.length) {
            let subtotal = 0;
            updateData.items.forEach(item => {
                item.amount = item.quantity * item.rate;
                subtotal += item.amount;
            });

            const tax_percent = updateData.tax_percent || 0;
            const tax_amount = (subtotal * tax_percent) / 100;

            updateData.subtotal = subtotal;
            updateData.tax_amount = tax_amount;
            updateData.total_amount = subtotal + tax_amount;
        }

        const updatedInvoice = await invoiceModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: updatedInvoice
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const deleteInvoiceController = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await invoiceModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Invoice deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export {
    createInvoiceController,
    readInvoiceController,
    readOneInvoiceController,
    updateInvoiceController,
    deleteInvoiceController
};
