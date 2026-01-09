import invoiceModel from "../Modals/invoicesModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";

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

        if (!inv_number || !customer_id || !items || items.length === 0 || !status) {
            return sendHttpResponse(res , 400 , false , "Missing required fields");
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
            status: status || "pending",
            items: processedItems,
            subtotal,
            tax_percent,
            tax_amount,
            total_amount,
            notes,
            created_by 
        });

        return sendHttpResponse(res , 201 , true , "Invoice saved successfully");

    } catch (error) {
        console.error("SERVER ERROR:", error);
        return sendHttpResponse(res , 500 , false , error.message);
    }
};


const readInvoiceController = async (req, res) => {
    try {
        const invoices = await invoiceModel
            .find()
            .populate("customer_id", "name") 
            .sort({ createdAt: -1 });
        return sendHttpResponse(res , 200 , true , "Data fetched successfully" , invoices);
    } catch (error) {
        return sendHttpResponse(res , 500 , false , error.message)
    }
};


const readOneInvoiceController = async (req, res) => {
  try {
    const { id } = req.body;

    const invoice = await invoiceModel
      .findById(id)
      .populate({
        path: "customer_id",
        select: "name"
      });

    if (!invoice) {
      return sendHttpResponse(res, 404, false, "Invoice not found");
    }

    return sendHttpResponse(
      res,
      200,
      true,
      "Invoice fetched successfully",
      invoice
    );

  } catch (error) {
    return sendHttpResponse(res, 500, false, error.message);
  }
};

const updateInvoiceController = async (req, res) => {
  try {
    const {id , updateData} = req.body;

    if (updateData.items?.length) {
      let subtotal = 0;
      updateData.items.forEach(item => {
        item.amount = Number(item.quantity) * Number(item.rate);
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
      {runValidators: true }
    );

    if (!updatedInvoice) {
      return sendHttpResponse(res, 404, false, "Invoice not found");
    }

    return sendHttpResponse(
      res,
      200,
      true,
      "Invoice updated successfully",
      updatedInvoice
    );

  } catch (error) {
    return sendHttpResponse(res, 500, false, error.message);
  }
};


const deleteInvoiceController = async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await invoiceModel.findByIdAndDelete(id);

    if (!deleted) {
      return sendHttpResponse(res, 404, false, "Invoice not found");
    }

    return sendHttpResponse(
      res,
      200,
      true,
      "Invoice deleted successfully"
    );

  } catch (error) {
    return sendHttpResponse(res, 500, false, error.message);
  }
};


export {
    createInvoiceController,
    readInvoiceController,
    readOneInvoiceController,
    updateInvoiceController,
    deleteInvoiceController
};
