const fromDateEl = document.querySelector(".fromDate");
const toDateEl = document.querySelector(".toDate");
const reportTypeEl = document.querySelector(".reportType");

const applyFilterBtn = document.querySelector(".applyFilterBtn");
const exportCSVBtn = document.querySelector(".exportCSV");
const exportXLSXBtn = document.querySelector(".exportXLSX");


const getTypeValue = () => {
    return reportTypeEl.value ? reportTypeEl.value : null;
};


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
fetch("/api/home/revenue" , {
    method : "POST",
    headers : {
        "Content-Type" : "application/json"
    }
}).then((res)=>{
    return res.json();
}).then((data)=>{
    if(data.success)
    {
        let revenue = Number(data.data.paid.totalAmount) + Number(data.data.due.totalAmount);
        let recivedPayment = Number(data.data.paid.paidAmount) + Number(data.data.due.paidAmount);
        let dueAmount = revenue - recivedPayment; 
        document.querySelector(".revenue").innerHTML = revenue;
        document.querySelector(".paymentRecived").innerHTML = recivedPayment;
        document.querySelector(".pendingDues").innerHTML = dueAmount;
    } else
    {
        showToast(data.msg , "danger");
    }
});
fetch("/api/home/invoice" , {
    method : "POST",
    headers : {
        "Content-Type" : "application/json"
    }
}).then((res)=>{
    return res.json();
}).then((data)=>{
    if(data.success)
    {
        document.querySelector(".invoice").innerHTML = data.data;
    } else
    {
        showToast(data.msg , "danger");
    }
});
function filterReport(from, to, type) {
    fetch("/api/report/filter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ from, to, type })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            showToast(data.msg, "warning");
            return;
        }

        const filteredData = data.data;
        const reportTableBody = document.querySelector(".reportTableBody");

        reportTableBody.innerHTML = "";

        function badgeColor(type, status) {
            if (type === "invoice") {
                switch (status) {
                    case "due": return "danger";
                    case "paid": return "success";
                    case "pending": return "warning";
                    default: return "info";
                }
            } else {
                switch (status) {
                    case "pending": return "warning";
                    case "completed": return "success";
                    case "canceled": return "danger";
                    default: return "info";
                }
            }
        }

        if (filteredData.length === 0) {
            reportTableBody.innerHTML = `
                <tr class="text-center">
                    <td colspan="8">NO REPORT FOUND</td>
                </tr>
            `;
            return;
        }
        filteredData.forEach((fd, i) => {
            reportTableBody.innerHTML += `
                <tr class="text-center">
                    <td>${i + 1}</td>
                    <td>${formatDate(fd.date)}</td>
                    <td>${fd.reference}</td>
                    <td>${fd.customer_name}</td>
                    <td>${fd.customer_email}</td>
                    <td>${fd.type}</td>
                    <td>${fd.amount}</td>
                    <td>
                        <span class="badge bg-${badgeColor(fd.type, fd.status)}">
                            ${fd.status.toUpperCase()}
                        </span>
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => {
        showToast(err.message || err, "danger");
    });
}

const exportReport = async (format) => {

    if (!fromDateEl.value || !toDateEl.value) {
        showToast("Please select From and To dates", "warning");
        return;
    }

    const res = await fetch("/api/report/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            from: fromDateEl.value,
            to: toDateEl.value,
            type: getTypeValue(),
            format
        })
    });

    if (!res.ok) {
        const error = await res.json();
        showToast(error.msg || "Export failed", "danger");
        return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `report.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};




applyFilterBtn.addEventListener("click", () => {
    filterReport(
        fromDateEl.value,
        toDateEl.value,
        getTypeValue()
    );
});


exportCSVBtn.addEventListener("click", () => exportReport("csv"));
exportXLSXBtn.addEventListener("click", () => exportReport("xlsx"));

const searchInput = document.querySelector(".searchInput");
searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll(".reportTableBody tr");
    rows.forEach(row => {
        if (row.children.length < 2) return;
        const customer = row.children[3].innerText.toLowerCase();
        const email = row.children[4].innerText.toLowerCase();
        if (customer.includes(filter) || email.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const year = new Date().getFullYear();

    fromDateEl.value = `${year}-01-01`;
    toDateEl.value = `${year}-12-31`;

    filterReport(fromDateEl.value, toDateEl.value, null);
});
