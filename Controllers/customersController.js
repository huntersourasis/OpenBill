import customersModal from "../Modals/customersModal.js";

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
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        
        const isExist = await customersModal.findOne({ email });
        if (isExist) {
            return res.status(409).json({
                success: false,
                message: "Customer with this email already exists"
            });
        }

        const customer = await customersModal.create({
            name,
            email,
            primary_ph,
            secondary_ph,
            address
        });

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customer
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating customer",
            error: error.message
        });
    }
};


const readCustomerController = async (req, res) => {
    try {
        const { id } = req.body;

        if (id) {
            const customer = await customersModal.findById(id);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: customer
            });
        }

        const customers = await customersModal.find({ status: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching customer(s)",
            error: error.message
        });
    }
};

const updateCustomerController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required"
            });
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
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: updatedCustomer
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating customer",
            error: error.message
        });
    }
};

const deleteCustomerController = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required"
            });
        }

        const deletedCustomer = await customersModal.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );

        if (!deletedCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting customer",
            error: error.message
        });
    }
};

export {
    createCustomerController,
    readCustomerController,
    updateCustomerController,
    deleteCustomerController
};
