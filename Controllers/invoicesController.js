import invoiceModel from "../Modals/invoicesModal.js";
import paymentsModal from "../Modals/paymentsModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
import puppeteer from "puppeteer";
import loadSettings from "../Utils/loadSettings.js";

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
            paid_amount : 0,
            notes,
            created_by 
        });

        return sendHttpResponse(res , 201 , true , `# Created Invoice ${inv_number}` , newInvoice);

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
      `# Updated Invoice ${updatedInvoice.inv_number}`,
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

    await paymentsModal.findOneAndDelete({invoice_id : id});

    return sendHttpResponse(
      res,
      200,
      true,
      `# Deleted Invoice ${deleted.inv_number}`
    );

  } catch (error) {
    return sendHttpResponse(res, 500, false, error);
  }
};

const viewInvoiceController = async (req , res) => {
try {
        const { id } = req.query;
        if(!id)
        { 
          return res.redirect("/");
        }
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const settings = await loadSettings();

        const invoiceData = await invoiceModel.findById(id).populate("customer_id" , "name address");
        const logoUrl = `http://127.0.0.1:${process.env.PORT}/images/openbill_logo.png`; 
        const companyName = settings.companyName;
        const companyAddress = settings.address;
        const gstNumber = settings.gstNumber;
        const invoiceNumber = invoiceData.inv_number;
        const invoiceDate = invoiceData.inv_date;
        const dueDate = invoiceData.due_date;
        const customerName = invoiceData.customer_id.name;
        const curtomerAddress = invoiceData.customer_id.address;
        const taxAmount = invoiceData.tax_amount;
        const subtotal = invoiceData.subtotal;
        const totalAmount = invoiceData.total_amount;
        const currency = settings.currency;
        const taxPercentage = invoiceData.tax_percent;
        function formatDate (date)
        {
            function getOrdinal(n) {
                if (n > 3 && n < 21) return "th";
                switch (n % 10) {
                    case 1: return "st";
                    case 2: return "nd";
                    case 3: return "rd";
                    default: return "th";
                }
            }
            const months = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Sep" , "Oct" , "Nov" , "Dec"];
            const formated = date.getDate() + getOrdinal(date.getDate) + " " + months[date.getMonth()] + ", " + date.getFullYear();
            return formated;
        }
         const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <style>
                  :root { 
                      --primary: #1a1a1a; 
                      --secondary: #6b7280; /* Refined Slate Gray */
                      --accent: #0052cc; 
                      --border: #f3f4f6; 
                      --summary-bg: #f9fafb; /* Light Secondary Background */
                      --table-header: #374151;
                  }
                  body { font-family: 'Inter', -apple-system, sans-serif; color: var(--primary); margin: 0; padding: 50px; line-height: 1.6; }

                  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                  .logo-wrapper { display: flex; align-items: center; gap: 15px; }
                  .company-logo { width: 50px; height: 50px; filter: grayscale(100%); opacity: 0.9; }

                  .brand-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
                  .tax-id-sm { font-size: 11px; color: var(--secondary); font-family: monospace; }

                  .invoice-label { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
                  .inv-number { font-size: 22px; font-weight: 300; color: var(--primary); }

                  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid var(--border); }
                  .section-title { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
                  .details strong { font-size: 14px; display: block; margin-bottom: 4px; color: #111827; }
                  .details p { margin: 0; font-size: 13px; color: var(--secondary); }

                  table { width: 100%; border-collapse: collapse; }
                  th { text-align: left; padding: 15px 0; border-bottom: 1px solid var(--primary); font-size: 11px; text-transform: uppercase; color: var(--table-header); letter-spacing: 0.5px; }
                  td { padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
                  .text-right { text-align: right; }
                  .item-desc { font-weight: 600; color: #111827; display: block; margin-bottom: 4px; }
                  .item-sub { font-size: 12px; color: var(--secondary); font-weight: 400; }

                  /* Updated Summary Box - Secondary Styling */
                  .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 30px; }
                  .summary-box { 
                      width: 320px; 
                      background: var(--summary-bg); 
                      padding: 30px; 
                      border-radius: 4px; 
                      border: 1px solid var(--border);
                  }
                  .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: var(--secondary); }
                  .total-row { 
                      display: flex; 
                      justify-content: space-between; 
                      margin-top: 15px; 
                      padding-top: 15px; 
                      border-top: 1px dashed #d1d5db; 
                      font-size: 18px; 
                      font-weight: 700; 
                      color: var(--primary); 
                  }

                  .footer { margin-top: 100px; display: flex; justify-content: space-between; font-size: 11px; color: var(--secondary); }
                  .conpany-address-design span { display: block; margin-bottom: 4px; }
              </style>
              <title>Invoice View</title>
          </head>
          <body>
              <div class="header-container">
                  <div class="logo-wrapper">
                      <img src="${logoUrl}" class="company-logo">
                      <div>
                          <div class="brand-name">${companyName}</div>
                          <div class="tax-id-sm">GSTIN: ${gstNumber}</div>
                      </div>
                  </div>
                  <div class="text-right">
                      <div class="invoice-label">Official Tax Invoice</div>
                      <div class="inv-number">${invoiceNumber}</div>
                  </div>
              </div>

              <div class="info-grid">
                  <div class="details">
                      <div class="section-title">Billed To</div>
                      <strong>${customerName}</strong>
                      <p>${curtomerAddress}</p>
                  </div>
                  <div class="details text-right">
                      <div class="section-title">Invoice Details</div>
                      <p><strong>Issued:</strong> ${formatDate(invoiceDate)}</p>
                      <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
                      <p><strong>Currency:</strong> ${currency}</p>
                  </div>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th style="width: 50%;">Product</th>
                          <th class="text-right">Qty</th>
                          <th class="text-right">Rate</th>
                          <th class="text-right">Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${invoiceData.items.map((item) => {
                        return `
                          <tr>
                            <td>
                              <span class="item-desc">${item.name}</span>
                            </td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">₹ ${item.rate}</td>
                            <td class="text-right"><strong>₹ ${item.amount}</strong></td>
                          </tr>`;
                    }).join('')}
                  </tbody>
              </table>

              <div class="summary-wrapper">
                  <div class="summary-box">
                      <div class="summary-row"><span>Subtotal</span><span>₹ ${subtotal}</span></div>
                      <div class="summary-row"><span>Tax (GST ${taxPercentage} %)</span><span>₹ ${taxAmount}</span></div>
                      <div class="total-row"><span>Total Amount</span><span>₹ ${totalAmount}</span></div>
                  </div>
              </div>

              <div class="footer">
                  <div class="conpany-address-design">
                      <div class="section-title" style="color: var(--primary);">Our Address</div>
                      <span>
                          ${companyAddress}
                      </span>
                  </div>
                  <div class="text-right" style="align-self: flex-end;">
                      <p>Thank you for your business.</p>
                      <p style="font-weight: 700; color: var(--primary);">${companyName}</p>
                  </div>
              </div>
          </body>
          </html>
        `;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true 
        });

        await browser.close();
        res.contentType("application/pdf");
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating invoice");
    }
}

const downloadInvoiceController = async (req , res) => {
  try {
        const { id } = req.query;
        if(!id)
        { 
          return res.redirect("/");
        }
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const settings = await loadSettings();

        const invoiceData = await invoiceModel.findById(id).populate("customer_id" , "name address");
        const logoUrl = `http://127.0.0.1:${process.env.PORT}/images/openbill_logo.png`; 
        const companyName = settings.companyName;
        const companyAddress = settings.address;
        const gstNumber = settings.gstNumber;
        const invoiceNumber = invoiceData.inv_number;
        const invoiceDate = invoiceData.inv_date;
        const dueDate = invoiceData.due_date;
        const customerName = invoiceData.customer_id.name;
        const curtomerAddress = invoiceData.customer_id.address;
        const taxAmount = invoiceData.tax_amount;
        const subtotal = invoiceData.subtotal;
        const totalAmount = invoiceData.total_amount;
        const currency = settings.currency;
        const taxPercentage = invoiceData.tax_percent;
        function formatDate (date)
        {
            function getOrdinal(n) {
                if (n > 3 && n < 21) return "th";
                switch (n % 10) {
                    case 1: return "st";
                    case 2: return "nd";
                    case 3: return "rd";
                    default: return "th";
                }
            }
            const months = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Sep" , "Oct" , "Nov" , "Dec"];
            const formated = date.getDate() + getOrdinal(date.getDate) + " " + months[date.getMonth()] + ", " + date.getFullYear();
            return formated;
        }
         const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <style>
                  :root { 
                      --primary: #1a1a1a; 
                      --secondary: #6b7280; /* Refined Slate Gray */
                      --accent: #0052cc; 
                      --border: #f3f4f6; 
                      --summary-bg: #f9fafb; /* Light Secondary Background */
                      --table-header: #374151;
                  }
                  body { font-family: 'Inter', -apple-system, sans-serif; color: var(--primary); margin: 0; padding: 50px; line-height: 1.6; }

                  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                  .logo-wrapper { display: flex; align-items: center; gap: 15px; }
                  .company-logo { width: 50px; height: 50px; filter: grayscale(100%); opacity: 0.9; }

                  .brand-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
                  .tax-id-sm { font-size: 11px; color: var(--secondary); font-family: monospace; }

                  .invoice-label { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
                  .inv-number { font-size: 22px; font-weight: 300; color: var(--primary); }

                  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid var(--border); }
                  .section-title { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
                  .details strong { font-size: 14px; display: block; margin-bottom: 4px; color: #111827; }
                  .details p { margin: 0; font-size: 13px; color: var(--secondary); }

                  table { width: 100%; border-collapse: collapse; }
                  th { text-align: left; padding: 15px 0; border-bottom: 1px solid var(--primary); font-size: 11px; text-transform: uppercase; color: var(--table-header); letter-spacing: 0.5px; }
                  td { padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
                  .text-right { text-align: right; }
                  .item-desc { font-weight: 600; color: #111827; display: block; margin-bottom: 4px; }
                  .item-sub { font-size: 12px; color: var(--secondary); font-weight: 400; }

                  /* Updated Summary Box - Secondary Styling */
                  .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 30px; }
                  .summary-box { 
                      width: 320px; 
                      background: var(--summary-bg); 
                      padding: 30px; 
                      border-radius: 4px; 
                      border: 1px solid var(--border);
                  }
                  .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: var(--secondary); }
                  .total-row { 
                      display: flex; 
                      justify-content: space-between; 
                      margin-top: 15px; 
                      padding-top: 15px; 
                      border-top: 1px dashed #d1d5db; 
                      font-size: 18px; 
                      font-weight: 700; 
                      color: var(--primary); 
                  }

                  .footer { margin-top: 100px; display: flex; justify-content: space-between; font-size: 11px; color: var(--secondary); }
                  .conpany-address-design span { display: block; margin-bottom: 4px; }
              </style>
              <title>Invoice View</title>
          </head>
          <body>
              <div class="header-container">
                  <div class="logo-wrapper">
                      <img src="${logoUrl}" class="company-logo">
                      <div>
                          <div class="brand-name">${companyName}</div>
                          <div class="tax-id-sm">GSTIN: ${gstNumber}</div>
                      </div>
                  </div>
                  <div class="text-right">
                      <div class="invoice-label">Official Tax Invoice</div>
                      <div class="inv-number">${invoiceNumber}</div>
                  </div>
              </div>

              <div class="info-grid">
                  <div class="details">
                      <div class="section-title">Billed To</div>
                      <strong>${customerName}</strong>
                      <p>${curtomerAddress}</p>
                  </div>
                  <div class="details text-right">
                      <div class="section-title">Invoice Details</div>
                      <p><strong>Issued:</strong> ${formatDate(invoiceDate)}</p>
                      <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
                      <p><strong>Currency:</strong> ${currency}</p>
                  </div>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th style="width: 50%;">Product</th>
                          <th class="text-right">Qty</th>
                          <th class="text-right">Rate</th>
                          <th class="text-right">Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${invoiceData.items.map((item) => {
                        return `
                          <tr>
                            <td>
                              <span class="item-desc">${item.name}</span>
                            </td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">₹ ${item.rate}</td>
                            <td class="text-right"><strong>₹ ${item.amount}</strong></td>
                          </tr>`;
                    }).join('')}
                  </tbody>
              </table>

              <div class="summary-wrapper">
                  <div class="summary-box">
                      <div class="summary-row"><span>Subtotal</span><span>₹ ${subtotal}</span></div>
                      <div class="summary-row"><span>Tax (GST ${taxPercentage} %)</span><span>₹ ${taxAmount}</span></div>
                      <div class="total-row"><span>Amount Due</span><span>₹ ${totalAmount}</span></div>
                  </div>
              </div>

              <div class="footer">
                  <div class="conpany-address-design">
                      <div class="section-title" style="color: var(--primary);">Our Address</div>
                      <span>
                          ${companyAddress}
                      </span>
                  </div>
                  <div class="text-right" style="align-self: flex-end;">
                      <p>Thank you for your business.</p>
                      <p style="font-weight: 700; color: var(--primary);">${companyName}</p>
                  </div>
              </div>
          </body>
          </html>
        `;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            printBackground: true 
        });

        await browser.close();
        const safeInvoice = invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Invoice-${safeInvoice}.pdf"`);
        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating invoice");
    }
}

const printInvoiceController = async (req , res) => {
      try {
        const { id } = req.query;
        if(!id)
        { 
          return res.redirect("/");
        }
        const settings = await loadSettings();

        const invoiceData = await invoiceModel.findById(id).populate("customer_id" , "name address");
        const logoUrl = `http://127.0.0.1:${process.env.PORT}/images/openbill_logo.png`; 
        const companyName = settings.companyName;
        const companyAddress = settings.address;
        const gstNumber = settings.gstNumber;
        const invoiceNumber = invoiceData.inv_number;
        const invoiceDate = invoiceData.inv_date;
        const dueDate = invoiceData.due_date;
        const customerName = invoiceData.customer_id.name;
        const curtomerAddress = invoiceData.customer_id.address;
        const taxAmount = invoiceData.tax_amount;
        const subtotal = invoiceData.subtotal;
        const totalAmount = invoiceData.total_amount;
        const currency = settings.currency;
        const taxPercentage = invoiceData.tax_percent;
        function formatDate (date)
        {
            function getOrdinal(n) {
                if (n > 3 && n < 21) return "th";
                switch (n % 10) {
                    case 1: return "st";
                    case 2: return "nd";
                    case 3: return "rd";
                    default: return "th";
                }
            }
            const months = ["Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" , "Jul" , "Sep" , "Oct" , "Nov" , "Dec"];
            const formated = date.getDate() + getOrdinal(date.getDate) + " " + months[date.getMonth()] + ", " + date.getFullYear();
            return formated;
        }
         const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <style>
                  :root { 
                      --primary: #1a1a1a; 
                      --secondary: #6b7280; /* Refined Slate Gray */
                      --accent: #0052cc; 
                      --border: #f3f4f6; 
                      --summary-bg: #f9fafb; /* Light Secondary Background */
                      --table-header: #374151;
                  }
                  body { font-family: 'Inter', -apple-system, sans-serif; color: var(--primary); margin: 0; padding: 50px; line-height: 1.6; }

                  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                  .logo-wrapper { display: flex; align-items: center; gap: 15px; }
                  .company-logo { width: 50px; height: 50px; filter: grayscale(100%); opacity: 0.9; }

                  .brand-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
                  .tax-id-sm { font-size: 11px; color: var(--secondary); font-family: monospace; }

                  .invoice-label { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
                  .inv-number { font-size: 22px; font-weight: 300; color: var(--primary); }

                  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 1px solid var(--border); }
                  .section-title { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
                  .details strong { font-size: 14px; display: block; margin-bottom: 4px; color: #111827; }
                  .details p { margin: 0; font-size: 13px; color: var(--secondary); }

                  table { width: 100%; border-collapse: collapse; }
                  th { text-align: left; padding: 15px 0; border-bottom: 1px solid var(--primary); font-size: 11px; text-transform: uppercase; color: var(--table-header); letter-spacing: 0.5px; }
                  td { padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
                  .text-right { text-align: right; }
                  .item-desc { font-weight: 600; color: #111827; display: block; margin-bottom: 4px; }
                  .item-sub { font-size: 12px; color: var(--secondary); font-weight: 400; }

                  /* Updated Summary Box - Secondary Styling */
                  .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 30px; }
                  .summary-box { 
                      width: 320px; 
                      background: var(--summary-bg); 
                      padding: 30px; 
                      border-radius: 4px; 
                      border: 1px solid var(--border);
                  }
                  .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: var(--secondary); }
                  .total-row { 
                      display: flex; 
                      justify-content: space-between; 
                      margin-top: 15px; 
                      padding-top: 15px; 
                      border-top: 1px dashed #d1d5db; 
                      font-size: 18px; 
                      font-weight: 700; 
                      color: var(--primary); 
                  }

                  .footer { margin-top: 100px; display: flex; justify-content: space-between; font-size: 11px; color: var(--secondary); }
                  .conpany-address-design span { display: block; margin-bottom: 4px; }
              </style>
              <title>Invoice View</title>
          </head>
          <body>
              <div class="header-container">
                  <div class="logo-wrapper">
                      <img src="${logoUrl}" class="company-logo">
                      <div>
                          <div class="brand-name">${companyName}</div>
                          <div class="tax-id-sm">GSTIN: ${gstNumber}</div>
                      </div>
                  </div>
                  <div class="text-right">
                      <div class="invoice-label">Official Tax Invoice</div>
                      <div class="inv-number">${invoiceNumber}</div>
                  </div>
              </div>

              <div class="info-grid">
                  <div class="details">
                      <div class="section-title">Billed To</div>
                      <strong>${customerName}</strong>
                      <p>${curtomerAddress}</p>
                  </div>
                  <div class="details text-right">
                      <div class="section-title">Invoice Details</div>
                      <p><strong>Issued:</strong> ${formatDate(invoiceDate)}</p>
                      <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
                      <p><strong>Currency:</strong> ${currency}</p>
                  </div>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th style="width: 50%;">Product</th>
                          <th class="text-right">Qty</th>
                          <th class="text-right">Rate</th>
                          <th class="text-right">Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${invoiceData.items.map((item) => {
                        return `
                          <tr>
                            <td>
                              <span class="item-desc">${item.name}</span>
                            </td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">₹ ${item.rate}</td>
                            <td class="text-right"><strong>₹ ${item.amount}</strong></td>
                          </tr>`;
                    }).join('')}
                  </tbody>
              </table>

              <div class="summary-wrapper">
                  <div class="summary-box">
                      <div class="summary-row"><span>Subtotal</span><span>₹ ${subtotal}</span></div>
                      <div class="summary-row"><span>Tax (GST ${taxPercentage} %)</span><span>₹ ${taxAmount}</span></div>
                      <div class="total-row"><span>Amount Due</span><span>₹ ${totalAmount}</span></div>
                  </div>
              </div>

              <div class="footer">
                  <div class="conpany-address-design">
                      <div class="section-title" style="color: var(--primary);">Our Address</div>
                      <span>
                          ${companyAddress}
                      </span>
                  </div>
                  <div class="text-right" style="align-self: flex-end;">
                      <p>Thank you for your business.</p>
                      <p style="font-weight: 700; color: var(--primary);">${companyName}</p>
                  </div>
              </div>
          </body>
          </html>
        `;

        res.send(htmlContent);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating invoice");
    }
}

export {
    createInvoiceController,
    readInvoiceController,
    readOneInvoiceController,
    updateInvoiceController,
    deleteInvoiceController,
    viewInvoiceController,
    downloadInvoiceController,
    printInvoiceController
};
