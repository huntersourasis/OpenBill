let confirmCallback = null;

function showConfirmModal({ title, message, confirmText, confirmClass, onConfirm }) {
    document.getElementById("confirmModalTitle").innerText = title;
    document.getElementById("confirmModalMessage").innerText = message;

    const btn = document.getElementById("confirmModalBtn");
    btn.innerText = confirmText;
    btn.className = `btn ${confirmClass}`;

    confirmCallback = onConfirm;

    new bootstrap.Modal(
        document.getElementById("confirmActionModal")
    ).show();
}

document.getElementById("confirmModalBtn").addEventListener("click", async () => {
    if (typeof confirmCallback === "function") {
        await confirmCallback();
    }

    bootstrap.Modal.getInstance(
        document.getElementById("confirmActionModal")
    ).hide();

    confirmCallback = null;
});
function cancelPayment(paymentId , invoiceId) {
    showConfirmModal({
        title: "Cancel Payment",
        message: "This payment will be marked as canceled. This action can be audited later.",
        confirmText: "Yes, Cancel",
        confirmClass: "btn-warning",
        onConfirm: async () => {
            const res = await fetch("/api/payments/cancel/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body : JSON.stringify({
                    id : paymentId,
                    invoice_id : invoiceId
                })
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.msg , "danger");
                return;
            }

            showToast(data.msg , "success")

            loadPayments();
        }
    });
}
function deletePayment(paymentId , invoiceId) {
    showConfirmModal({
        title: "Delete Payment",
        message: "This will permanently delete the payment. This action cannot be undone.",
        confirmText: "Delete Permanently",
        confirmClass: "btn-danger",
        onConfirm: async () => {
            const res = await fetch("/api/payments/delete/", {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    id : paymentId,
                    invoice_id : invoiceId
                })
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.msg , "danger");
                return;
            }
            showToast(data.msg , "success")
            loadPayments();
        }
    });
}

        const customerSelect = document.querySelector('[name="customer_id"]');
        const invoiceSelect  = document.querySelector('[name="invoice_id"]');
        const invoiceAmount  = document.querySelector('[name="amount"]');
        const payingAmount   = document.querySelector('[name="p_amount"]');
        const dueAmount      = document.querySelector('[name="d_amount"]');
        const paymentForm    = document.getElementById("paymentForm");

function loadCustomers()
{        
    fetch("/api/customers/read" , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            }
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) return;
                customerSelect.innerHTML = `<option value="">Select Customer</option>`;
                res.data.customers.forEach(c => {
                    customerSelect.innerHTML +=
                        `<option value="${c._id}">${c.name} (${c.email})</option>`;
                });
        });
}


        customerSelect.addEventListener("change", async () => {
            invoiceSelect.innerHTML = `<option value="">Select Invoice</option>`;
            invoiceAmount.value = "";
            payingAmount.value = "";
            dueAmount.value = "";

            if (!customerSelect.value) return;

            const res = await fetch('/api/payments/get-invoices' , {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    customer_id : customerSelect.value
                })
            });
            const data = await res.json();

            if (!data.success) return;

            data.data.forEach(inv => {
                invoiceSelect.innerHTML +=
                    `<option value="${inv._id}">
                        ${inv.inv_number}
                    </option>`;
            });
    });


        invoiceSelect.addEventListener("change", async () => {
            if (!invoiceSelect.value) return;

            const res = await fetch("/api/payments/get-amount" , {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    invoice_id : invoiceSelect.value
                })
            });
            const data = await res.json();

            if (!data.success) return;

            invoiceAmount.value = data.data.remaining_amount;
            payingAmount.value = 0;
            dueAmount.value = data.data.remaining_amount;
        });


        payingAmount.addEventListener("input", () => {
            const total = Number(invoiceAmount.value) || 0;
            const paid  = Number(payingAmount.value) || 0;
            if (Number(payingAmount.value) > Number(invoiceAmount.value))
            {
                payingAmount.value = invoiceAmount.value;
            }   
            dueAmount.value = Math.max(total - paid, 0);
        });

        paymentForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                customer_id: customerSelect.value,
                invoice_id : invoiceSelect.value,
                amount : Number(payingAmount.value),
                due_amount : Number(dueAmount.value),
                payment_mode: document.querySelector('[name="mode"]').value,
                payment_date: document.querySelector('[name="payment_date"]').value,
                notes       : document.querySelector('[name="notes"]').value
            };

            const res = await fetch("/api/payments/create", {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify(payload)
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.msg , "danger");
                return;
            }
            showToast(data.msg , "success");
            bootstrap.Modal.getInstance(
                document.getElementById("addPaymentModal")
            ).hide();

            paymentForm.reset();
            loadPayments();
        });
        

    async function loadPayments() {
        const tbody = document.getElementById("paymentsTable");
        tbody.innerHTML = "";

        const res = await fetch("/api/payments/read" , {
            method : "POST",
            headers : {
                "content-Type" : "application/json"
            }
        });
        const data = await res.json();

        if (!data.success) return;
        function formatePaymant (raw)
        {
            switch (raw) {
                case 'cash':
                    return "Cash";
                    break;
                case 'BT':
                    return "Bank Transfer";
                    break;
                case 'card':
                    return "Card";
                    break;
                case 'UPI':
                    return "UPI";
                    break;
                default:
                    return "NULL";
                    break;
            }
        }
        if(data.data.length == 0)
        {   
            tbody.innerHTML += `
                <tr class='text-center'>
                    <td colspan='9'>NO PAYMENTS FOUND</td>    
                </tr>
            `;
        }
        let total_payment = 0;
        let this_month_payment = 0;
        let due_amount = 0;
        const currMonth = new Date().getMonth();
        data.data.forEach((p, i) => {
            const p_month = new Date(p.payment_date).getMonth();
            total_payment += Number(p.amount);
            due_amount += p.due_amount;
            if (currMonth == p_month) { this_month_payment += Number(p.amount) }
            tbody.innerHTML += `
                <tr class='text-center'>
                    <td>${i + 1}</td>
                    <td>${formatDate(p.payment_date)}</td>
                    <td>${p.customer_id?.name || "-"}</td>
                    <td>${p.invoice_id?.inv_number || "-"}</td>
                    <td class='fw-bold'>₹ ${p.amount.toLocaleString()}</td>
                    <td>₹ ${p.due_amount.toLocaleString()}</td>
                    <td>
                        <span class="badge ${
                            p.payment_mode === "cash"
                                ? "bg-success"
                                : "bg-primary"
                        }">
                            ${formatePaymant(p.payment_mode)}
                        </span>    
                    </td>
                    <td>
                        <span class="badge ${
                            p.status === "completed"
                                ? "bg-success"
                                : p.status === "pending"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                        }">
                            ${p.status.toUpperCase()}
                        </span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1"
                            onclick="editPayment('${p._id}')">
                            <i class="fa fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning me-1"
                            onclick="cancelPayment('${p._id}' , '${p.invoice_id._id}')">
                            <i class="fa fa-ban"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger"
                            onclick="deletePayment('${p._id}' , '${p.invoice_id._id}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        document.querySelector(".total_payment").innerHTML = total_payment;
        document.querySelector(".this_month").innerHTML = this_month_payment;
        document.querySelector(".dues").innerHTML = due_amount;
    }
    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }
    function formatDate(dateString) {
        const date = new Date(dateString);

        const day = date.getDate(); 

        const month = date.toLocaleString('default', { month: 'short' }); 

        const year = date.getFullYear(); 

        return `${day}${getOrdinal(day)} ${month}, ${year}`;
    }
    async function editPayment(paymentId) {
        const res = await fetch("/api/payments/read-one", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: paymentId })
        });

        const data = await res.json();
        if (!data.success) {
            showToast(data.msg, "danger");
            return;
        }

        const p = data.data;

        document.getElementById("edit_payment_id").value = p._id;
        document.getElementById("edit_customer").value =
            `${p.customer_id.name} (${p.customer_id.email})`;
        document.getElementById("edit_invoice").value = p.invoice_id.inv_number;

        const invoiceTotal = p.amount + p.due_amount;

        document.getElementById("edit_invoice_amount").value = invoiceTotal;
        document.getElementById("edit_paid_amount").value = p.amount;
        document.getElementById("edit_due_amount").value = p.due_amount;

        document.getElementById("edit_payment_mode").value = p.payment_mode;
        document.getElementById("edit_payment_date").value =
            p.payment_date.split("T")[0];
        document.getElementById("edit_notes").value = p.notes || "";

        new bootstrap.Modal(
            document.getElementById("editPaymentModal")
        ).show();
    }
    document
    .getElementById("edit_paid_amount")
    .addEventListener("input", () => {

        const total = Number(
            document.getElementById("edit_invoice_amount").value
        );

        const paid = Number(
            document.getElementById("edit_paid_amount").value
        );

        if (paid > total) {
            document.getElementById("edit_paid_amount").value = total;
        }

        document.getElementById("edit_due_amount").value =
            Math.max(total - paid, 0);
    });
    document
    .getElementById("editPaymentForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();
        const updateID =  document.getElementById("edit_payment_id").value;
        const payload = {
            amount: Number(document.getElementById("edit_paid_amount").value),
            due_amount: Number(document.getElementById("edit_due_amount").value),
            payment_mode: document.getElementById("edit_payment_mode").value,
            payment_date: document.getElementById("edit_payment_date").value,
            notes: document.getElementById("edit_notes").value
        };

        const res = await fetch("/api/payments/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({id : updateID , updates : payload})
        });

        const data = await res.json();
        if (!data.success) {
            showToast(data.msg, "danger");
            return;
        }

        showToast(data.msg , "success");

        bootstrap.Modal.getInstance(
            document.getElementById("editPaymentModal")
        ).hide();

        loadPayments();
    });

    document.addEventListener("DOMContentLoaded" , ()=>{
        loadPayments();
        loadCustomers();
        const today = new Date().toISOString().split("T")[0];
        document.querySelector('[name="payment_date"]').value = today;
    })