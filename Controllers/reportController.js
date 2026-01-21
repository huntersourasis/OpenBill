import invoiceModal from "../Modals/invoicesModal.js";
import paymentsModal from "../Modals/paymentsModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
import { Parser } from "json2csv";
import ExcelJS from 'exceljs'; 

const filterController = async (req, res) => {
    try {
        const { from, to, type } = req.body;

        if (!from || !to) {
            return sendHttpResponse(
                res,
                400,
                false,
                "from and to dates are required",
                null
            );
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        let data = [];

        if (!type || type === "invoice") {
            const invoiceData = await invoiceModal.aggregate([
                {
                    $match: {
                        inv_date: {
                            $gte: fromDate,
                            $lte: toDate
                        }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customer_id",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                { $unwind: "$customer" },
                {
                    $project: {
                        _id: 0,
                        date: "$inv_date",
                        reference: "$inv_number",
                        customer_name: "$customer.name",
                        customer_email: "$customer.email",
                        type: { $literal: "invoice" },
                        amount: "$total_amount",
                        status: "$status"
                    }
                }
            ]);

            data.push(...invoiceData);
        }

        if (!type || type === "payment") {
            const paymentData = await paymentsModal.aggregate([
                {
                    $match: {
                        payment_date: {
                            $gte: fromDate,
                            $lte: toDate
                        }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customer_id",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                { $unwind: "$customer" },
                {
                    $project: {
                        _id: 0,
                        date: "$payment_date",
                        reference: { $toString: "$_id" },
                        customer_name: "$customer.name",
                        customer_email: "$customer.email",
                        type: { $literal: "payment" },
                        amount: "$amount",
                        status: "$status"
                    }
                }
            ]);

            data.push(...paymentData);
        }

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        return sendHttpResponse(
            res,
            200,
            true,
            "Report generated successfully",
            data
        );

    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Failed to generate report",
            error.message
        );
    }
};

const exportReportController = async (req, res) => {
    try {
        const { from, to, type, format } = req.body;

        if (!from || !to || !format) {
            return sendHttpResponse(
                res,
                400,
                false,
                "from, to and format are required",
                null
            );
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);

        let data = [];

        if (!type || type === "invoice") {
            const invoices = await invoiceModal.aggregate([
                {
                    $match: {
                        inv_date: { $gte: fromDate, $lte: toDate }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customer_id",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                { $unwind: "$customer" },
                {
                    $project: {
                        Date: "$inv_date",
                        Reference: "$inv_number",
                        Customer: "$customer.name",
                        Email: "$customer.email",
                        Type: { $literal: "Invoice" },
                        Amount: "$total_amount",
                        Status: "$status"
                    }
                }
            ]);
            data.push(...invoices);
        }

        if (!type || type === "payment") {
            const payments = await paymentsModal.aggregate([
                {
                    $match: {
                        payment_date: { $gte: fromDate, $lte: toDate }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "customer_id",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                { $unwind: "$customer" },
                {
                    $project: {
                        Date: "$payment_date",
                        Reference: { $toString: "$_id" },
                        Customer: "$customer.name",
                        Email: "$customer.email",
                        Type: { $literal: "Payment" },
                        Amount: "$amount",
                        Status: "$status"
                    }
                }
            ]);
            data.push(...payments);
        }

        if (!data.length) {
            return sendHttpResponse(res, 404, false, "No data found", null);
        }

    
        if (format === "csv") {
            const parser = new Parser();
            const csv = parser.parse(data);

            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=report.csv"
            );

            return res.status(200).send(csv);
        }

        if (format === "xlsx") {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Report");

            sheet.columns = Object.keys(data[0]).map(key => ({
                header: key,
                key: key,
                width: 20
            }));

            data.forEach(row => sheet.addRow(row));

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=report.xlsx"
            );

            await workbook.xlsx.write(res);
            return res.end();
        }

        return sendHttpResponse(res, 400, false, "Invalid format", null);

    } catch (error) {
        return sendHttpResponse(
            res,
            500,
            false,
            "Export failed",
            error.message
        );
    }
};

export { filterController , exportReportController};
