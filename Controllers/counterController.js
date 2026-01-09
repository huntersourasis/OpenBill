import Counter from "../Modals/counterModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
import {formatInvoiceNumber , formatNumber} from "../Utils/format_inv.js";
const generateInvoiceNumberController = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "invoice" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    sendHttpResponse(res, 200, true, "Invoice number generated successfully.", {
      inv_number: formatNumber(counter.seq , 5),
      formatted: formatInvoiceNumber(counter.seq , 5)
    });

  } catch (error) {
    sendHttpResponse(res, 500, false, "Failed to generate invoice number.", {
      error: error.message
    });
  }
};

const loadInvoiceNumber = async (req, res) => {
  try {
    const counter = await Counter.findById("invoice").lean();

    const nextSeq = counter ? counter.seq + 1 : 1;

    sendHttpResponse(res, 200, true, "Invoice number loaded successfully.", {
      inv_number: formatNumber(nextSeq, 5),
      formatted: formatInvoiceNumber(nextSeq, 5),
      preview: true
    });

  } catch (error) {
    sendHttpResponse(res, 500, false, "Failed to load invoice number.", {
      error: error.message
    });
  }
};

export {generateInvoiceNumberController , loadInvoiceNumber};
