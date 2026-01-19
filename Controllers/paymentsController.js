import mongoose from "mongoose";
import paymentsModal from "../Modals/paymentsModal.js";
import invoiceModel from "../Modals/invoicesModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";

const createPaymentController = async (req, res) => {
    try {
        const {
            customer_id,
            invoice_id,
            amount,
            payment_mode,
            payment_date,
            notes
        } = req.body;

        if (!customer_id || !invoice_id || !amount) {
            return sendHttpResponse(
                res,
                400,
                false,
                "customer_id, invoice_id and amount are required",
                null
            );
        }

        if (amount <= 0) {
            return sendHttpResponse(
                res,
                400,
                false,
                "Amount must be greater than zero",
                null
            );
        }

        const invoice = await invoiceModel.findById(invoice_id);
        if (!invoice) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Invoice not found",
                null
            );
        }

        const remainingAmount =
            invoice.total_amount - (invoice.paid_amount);

        if (amount > remainingAmount) {
            return sendHttpResponse(
                res,
                400,
                false,
                "Payment exceeds remaining invoice amount",
                null
            );
        }

        const payment = await paymentsModal.create({
            customer_id,
            invoice_id,
            amount,
            due_amount: remainingAmount - amount,
            payment_mode,
            payment_date,
            notes,
            status: "completed"
        });

        invoice.paid_amount = (invoice.paid_amount) + amount;
        invoice.status =
            invoice.paid_amount >= invoice.total_amount
                ? "paid"
                : "due";

        await invoice.save();

        return sendHttpResponse(
            res,
            201,
            true,
            "Payment recorded successfully",
            payment
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to create payment",
            error.message
        );
    }
};


const readPaymentController = async (req, res) => {
    try {
        const payments = await paymentsModal
            .find()
            .populate("customer_id", "name email")
            .populate("invoice_id", "inv_number total_amount");

        return sendHttpResponse(
            res,
            200,
            true,
            "Payments fetched successfully",
            payments
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to fetch payments",
            error.message
        );
    }
};

const readOnePaymentController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendHttpResponse(
                res,
                400,
                false,
                "Invalid payment ID",
                null
            );
        }

        const payment = await paymentsModal
            .findById(id)
            .populate("customer_id", "name email")
            .populate("invoice_id", "inv_number total_amount");

        if (!payment) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Payment not found",
                null
            );
        }

        return sendHttpResponse(
            res,
            200,
            true,
            "Payment fetched successfully",
            payment
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to fetch payment",
            error.message
        );
    }
};

const updatePaymentController = async (req, res) => {
    try {
        const { id } = req.body;
        const {updates} = req.body;

        const allowedUpdates = ["payment_mode", "notes", "status" , "payment_date"];
        const filteredUpdates = {};

        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        }

        const payment = await paymentsModal.findByIdAndUpdate(
            id,
            filteredUpdates,
            { new: true }
        );

        if (!payment) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Payment not found",
                null
            );
        }

        return sendHttpResponse(
            res,
            200,
            true,
            "Payment updated successfully",
            payment
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to update payment",
            error.message
        );
    }
};

const deletePaymentController = async (req, res) => {
    try {
        const { id , invoice_id } = req.body;

        const invoice = await invoiceModel.findById(invoice_id);
        const payment = await paymentsModal.findById(id);
        if(invoice)
        {
            if ((invoice.paid_amount - payment.amount) <= 0) {
                invoice.status = "pending";
            } else
            {
                invoice.status = "due";
            }
            invoice.paid_amount = invoice.paid_amount - payment.amount;
            await invoice.save();
        }
        
        await paymentsModal.findByIdAndDelete(id);
        return sendHttpResponse(
            res,
            200,
            true,
            "Payment deleted successfully",
            null
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to delete payment",
            error.message
        );
    }
};

const cancelPaymentController = async (req, res) => {
    try {
        const { id , invoice_id } = req.body;

        const payment = await paymentsModal.findById(id);
        if (!payment) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Payment not found",
                null
            );
        }
        const invoice = await invoiceModel.findById(invoice_id);
        if(invoice)
        {
            if ((invoice.paid_amount - payment.amount) <= 0) {
                invoice.status = "pending";
            } else
            {
                invoice.status = "due";
            }
            invoice.paid_amount = invoice.paid_amount - payment.amount;
            await invoice.save();
        }

        payment.status = "canceled";
        await payment.save();

        return sendHttpResponse(
            res,
            200,
            true,
            "Payment canceled successfully",
            null
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to cancel payment",
            error.message
        );
    }
};
const getInvoicesController = async (req, res) => {
    try {
        const { customer_id } = req.body;

        const invoices = await invoiceModel.find({
            customer_id,
            status: { $nin : ["paid" , "cancelled"] }
        });

        return sendHttpResponse(
            res,
            200,
            true,
            "Invoices fetched successfully",
            invoices
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to fetch invoices",
            error.message
        );
    }
};

const getAmountController = async (req, res) => {
    try {
        const { invoice_id } = req.body;

        const invoice = await invoiceModel.findById(invoice_id);
        if (!invoice) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Invoice not found",
                null
            );
        }

        const remainingAmount =
            invoice.total_amount - (invoice.paid_amount || 0);

        return sendHttpResponse(
            res,
            200,
            true,
            "Remaining amount calculated successfully",
            { remaining_amount: remainingAmount }
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to calculate remaining amount",
            error.message
        );
    }
};

export {
    createPaymentController,
    readPaymentController,
    readOnePaymentController,
    updatePaymentController,
    deletePaymentController,
    cancelPaymentController,
    getInvoicesController,
    getAmountController
};
