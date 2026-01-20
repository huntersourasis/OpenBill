import invoiceModal from "../Modals/invoicesModal.js";
import customersModal from "../Modals/customersModal.js";
import paymentsModal from "../Modals/paymentsModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
import { productsModal } from "../Modals/productsModal.js";


const invoiceController = async (req, res) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const startOfNextYear = new Date(new Date().getFullYear() + 1, 0, 1);

        const countInvoice = await invoiceModal.countDocuments({
            createdAt: {
                $gte: startOfYear,
                $lt: startOfNextYear
            }
        });

        return sendHttpResponse(
            res,
            200,
            true,
            "Current Year Invoice Counted Successfully",
            countInvoice
        );
    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Error : Invoice Controller in Home",
            error
        );
    }
};


const customerController = async (req , res) =>
{
    try {
        let countCustomer = await customersModal.countDocuments();
        return sendHttpResponse(res , 200 , true , "Customer Counted Successfully" , countCustomer);
    } catch (error) {
        return sendHttpResponse(res , 401 , false , "Error : Customer Controller in Home" , error);
    }
}

const revenueController = async (req , res) =>
{
    try
    {    
        const result = await invoiceModal.aggregate([
          {
            $match: {
              status: { $in: ["paid", "due"] }
            }
          },
          {
            $group: {
              _id: "$status",
              totalAmount: { $sum: "$total_amount" },
              count: { $sum: 1 },
              paidAmount : { $sum: "$paid_amount" }
            }
          }
        ]);

        const summary = {
          paid: { totalAmount: 0, count: 0 , paidAmount : 0},
          due: { totalAmount: 0, count: 0  , paidAmount : 0}
        };

        result.forEach(r => {
          summary[r._id] = {
            totalAmount: r.totalAmount,
            count: r.count,
            paidAmount : r.paidAmount
          };
        });
        return sendHttpResponse(res , 200 , true , "Revenue Fetched Successfully" , summary);
    }
    catch(err)
    {
        return sendHttpResponse(res , 403 , false , "Error : Revenue Controller in Home" , err);
    }
}

const productController = async (req , res) =>
{
  try { 
      const countProduct = await productsModal.countDocuments({
        stock : {
          $ne : 0
        }
      })
      return sendHttpResponse(res , 200 , true , "Product Counted Successfully" , countProduct);
  } catch (error) {
      return sendHttpResponse(res , 403 , false , "Error : Product Controller in Home" , err);
  }
}


export {
    invoiceController,
    customerController,
    revenueController,
    productController
}