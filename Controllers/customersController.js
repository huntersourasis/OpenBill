import customersModal from "../Modals/customersModal.js";
import invoiceModal from "../Modals/invoicesModal.js";
import paymentsModal from "../Modals/paymentsModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
const createCustomerController = async (req, res) => {
    try {
        const {
            name,
            email,
            primary_ph,
            secondary_ph,
            address,
            createdBy
        } = req.body;

        if (!name || !email || !primary_ph || !address) {
            return sendHttpResponse(
                res,
                400,
                false,
                "Required fields are missing"
            );
        }

        const isExist = await customersModal.findOne({ email });
        if (isExist) {
            return sendHttpResponse(
                res,
                409,
                false,
                "Customer with this email already exists"
            );
        }

        const customer = await customersModal.create({
            name,
            email,
            primary_ph,
            secondary_ph,
            address,
            createdBy
        });

        return sendHttpResponse(
            res,
            201,
            true,
            `# Created Customer ${customer._id}`,
            customer
        );

    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            error.message
        );
    }
};


const readCustomerController = async (req, res) => {
    try {
        const customers = await customersModal
            .find({ status: true })
            .sort({ createdAt: -1 })
            .lean();

        const customerIds = customers.map(c => c._id);
        const invoiceAgg = await invoiceModal.aggregate([
            {
                $match: {
                    customer_id: { $in: customerIds },
                    status: { $in: ["paid", "due" , "pending"] }
                }
            },
            {
                $group: {
                    _id: "$customer_id",
                    totalInvoiceCount: { $sum: 1 },
                    paidAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "due"] },
                                "$paid_amount",  
                                0
                            ]
                        }
                    },
                    totalAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "due"] },
                                "$total_amount",  
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const invoiceMap = new Map(
            invoiceAgg.map(i => [
                i._id.toString(),
                {
                    totalInvoiceCount: i.totalInvoiceCount,
                    paidAmount: i.paidAmount,
                    totalAmount: i.totalAmount
                }
            ])
        );

        const enrichedCustomers = customers.map(customer => {
            const data = invoiceMap.get(customer._id.toString()) || {
                totalInvoiceCount: 0,
                paidAmount: 0,
                totalAmount : 0
            };

            return {
                ...customer,
                totalInvoiceCount: data.totalInvoiceCount,
                paidAmount: data.paidAmount,
                totalAmount: data.totalAmount
            };
        });

        return sendHttpResponse(
            res,
            200,
            true,
            "Customers fetched successfully",
            {
                count: enrichedCustomers.length,
                customers: enrichedCustomers
            }
        );

    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Error fetching customer(s)",
            error.message
        );
    }
};

const readOneCustomerController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return sendHttpResponse(res, 400, false, "Customer ID is required");
        }

        // Fetch customer
        const customer = await customersModal.findById(id).lean();
        if (!customer) {
            return sendHttpResponse(res, 404, false, "Customer not found");
        }

        // Fetch invoices (only invoice_number field)
        const invoices = await invoiceModal.find(
            { customer_id: id },
            { inv_number: 1, status : 1 , _id: 0 }
        );

        // Attach invoice numbers
        customer.invoices = invoices.map(inv => ({
            invoice_number: inv.inv_number,
            status: inv.status
        }));

        return sendHttpResponse(
            res,
            200,
            true,
            "Customer fetched successfully",
            customer
        );

    } catch (error) {
        return sendHttpResponse(res, 500, false, "Internal Error", error);
    }
};


const updateCustomerController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return sendHttpResponse(
                res,
                400,
                false,
                "Customer ID is required"
            );
        }

        const updatedCustomer = await customersModal.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCustomer) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Customer not found"
            );
        }

        return sendHttpResponse(
            res,
            200,
            true,
            `# Updated Customer ${updatedCustomer._id}`,
            updatedCustomer
        );

    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            error.message
        );
    }
};


const deleteCustomerController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return sendHttpResponse(
                res,
                400,
                false,
                "Customer ID is required"
            );
        }

        const deletedCustomer = await customersModal.findByIdAndDelete(id);
        await invoiceModal.deleteMany({customer_id : id});
        await paymentsModal.deleteMany({customer_id : id});

        if (!deletedCustomer) {
            return sendHttpResponse(
                res,
                404,
                false,
                "Customer not found"
            );
        }

        return sendHttpResponse(
            res,
            200,
            true,
            `# Deleted Customer ${id}`
        );

    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Error deleting customer",
            error.message
        );
    }
};

export {
    createCustomerController,
    readCustomerController,
    readOneCustomerController,
    updateCustomerController,
    deleteCustomerController,
};
