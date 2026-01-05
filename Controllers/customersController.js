import customersModal from "../Modals/customersModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
const createCustomerController = async (req, res) => {
    try {
        const {
            name,
            email,
            primary_ph,
            secondary_ph,
            address
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
            address
        });

        return sendHttpResponse(
            res,
            201,
            true,
            "Customer created successfully",
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
            .sort({ createdAt: -1 });

        return sendHttpResponse(
            res,
            200,
            true,
            "Customers fetched successfully",
            {
                count: customers.length,
                customers: customers
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

const readOneCustomerController = async (req , res) => {
    try {
        const { id } = req.body;
        if (id) {
            const customer = await customersModal.findById(id);
            if (!customer) {
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
                "Customer fetched successfully",
                customer
            );
        }
    } catch (error) {
        return sendHttpResponse(res , 500 , false , "Internal Error");
    }
}

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
            "Customer updated successfully",
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

        const deletedCustomer = await customersModal.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );

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
            "Customer deleted successfully"
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
    deleteCustomerController
};
