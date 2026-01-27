const saveBtn = document.querySelector(".saveBtn");
    saveBtn.addEventListener("click" , (e)=>{
        e.preventDefault();
        const name = document.querySelector("#name");
        const email = document.querySelector("#email");
        const primaryPhone = document.querySelector("#primary_phone");
        const secondaryPhone = document.querySelector("#secondary_phone");
        const address = document.querySelector("#address");
        fetch("/api/customers/create" , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                name : name.value,
                email : email.value,
                primary_ph : primaryPhone.value,
                secondary_ph : secondaryPhone.value,
                address : address.value,
                createdBy : document.getElementById("user_email").value
            })
        })
        .then((res)=>{
            return res.json();
        }).then((data)=>{
            if(data.success)
            {
                const modalEl = document.getElementById("addCustomerModal");
                const modal = bootstrap.Modal.getInstance(modalEl);
                showToast(data.msg);
                modal.hide();
                document.querySelectorAll("#addCustomerModal input, textarea").forEach(i => i.value = "");
                loadCustomers();
            } else 
            {
                showToast(data.msg , "warning");
            }
        }).catch((err)=>{
            showToast(err , "danger");
        })
    })
const tableBody = document.getElementById("customerTable");
async function loadCustomers() {
    const res = await fetch("/api/customers/read" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        }
    });
    const data = await res.json();
    tableBody.innerHTML = "";
    document.querySelector(".totalCustomers").innerHTML = data.data.count;
    document.querySelector(".activeCustomers").innerHTML = 0;
    if(data.data.customers.length == 0)
    {
        tableBody.innerHTML += `
            <tr class='text-center'>
                <td colspan='9'>NO CUSTOMER FOUND</td>
            </tr>
        `;
    }
    data.data.customers.forEach((c, i) => {
        tableBody.innerHTML += `
        <tr class='text-center'>
          <td>${i + 1}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.primary_ph}</td>
          <td>${c.secondary_ph}</td>
          <td>${c.totalInvoiceCount}</td>
          <td class='fw-bold'>₹ ${Number(c.totalAmount) - Number(c.paidAmount)}</td>
          <td>
            <span class="badge ${true ? "bg-success" : "bg-secondary"}">
              ${true ? "Active" : "Inactive"}
            </span>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary" onclick="viewCustomer('${c._id}')">
              <i class="fa fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning" onclick="editCustomer('${c._id}')">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${c._id}')">
              <i class="fa fa-trash"></i>
            </button>
          </td>
        </tr>`;
    });
}
async function viewCustomer(id) {
    const res = await fetch("/api/customers/read-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });
    const result = await res.json();
    if (!result.success) {
        showToast(result.msg, "danger");
        return;
    }
    const c = result.data;
    document.getElementById("viewCustomerBody").innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Customer Name</label>
            <input class="form-control" value="${c.name}" readonly>
        </div>
        <div class="col-md-6">
            <label class="form-label">Email</label>
            <input class="form-control" value="${c.email}" readonly>
        </div>
        <div class="col-md-6">
            <label class="form-label">Primary Phone</label>
            <input class="form-control" value="${c.primary_ph}" readonly>
        </div>
        <div class="col-md-6">
            <label class="form-label">Secondary Phone</label>
            <input class="form-control" value="${c.secondary_ph || "-"}" readonly>
        </div>
        <div class="col-12">
            <label class="form-label">Address</label>
            <textarea class="form-control" rows="3" readonly>${c.address}</textarea>
        </div>

    `;
    document.getElementById("viewCustomerInvoice").innerHTML = `
        <label class="form-label fw-bold">Customer Invoices</label>
    `;

    c.invoices.forEach(e =>{
        document.getElementById("viewCustomerInvoice").innerHTML += `
            <div class='col-md-3'>
                <input type="text" class="form-control" value="${e}" readonly>
            </div>
        `;
    })
    document.getElementById("viewCustomerCreationInfo").innerHTML = `
        <div class="col-md-6">
            <label class="form-label">Created By</label>
            <input class="form-control" value="${c.createdBy}" readonly>
        </div>
        <div class="col-md-6">
            <label class="form-label">Created At</label>
            <input class="form-control" value="${new Date(c.createdAt).toLocaleString()}" readonly>
        </div>
    `;
    const modal = new bootstrap.Modal(document.getElementById("viewCustomerModal"));
    modal.show();
}
async function editCustomer(id) {
    const res = await fetch("/api/customers/read-one", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id })
    });
    const { data } = await res.json();
    edit_id.value = data._id;
    edit_name.value = data.name;
    edit_email.value = data.email;
    edit_primary.value = data.primary_ph;
    edit_secondary.value = data.secondary_ph || "";
    edit_address.value = data.address;
    new bootstrap.Modal("#editCustomerModal").show();
}
async function updateCustomer() {
    const res = await fetch("/api/customers/update", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: edit_id.value,
            name: edit_name.value,
            email: edit_email.value,
            primary_ph: edit_primary.value,
            secondary_ph: edit_secondary.value,
            address: edit_address.value
        })
    });
    const data = await res.json();
    if(data.success)
    {
        showToast(data.msg);   
    } else
    {
        showToast(data.msg , "warning");
    }
    bootstrap.Modal.getInstance(editCustomerModal).hide();
    loadCustomers();
}
function confirmDelete(id) {
    delete_id.value = id;
    new bootstrap.Modal("#deleteConfirmModal").show();
}
async function deleteCustomer() {
    const res = await fetch("/api/customers/delete", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id: delete_id.value })
    });
    const data = await res.json();
    showToast(data.msg);
    bootstrap.Modal.getInstance(deleteConfirmModal).hide();
    loadCustomers();
}
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#customerTable tr");
    rows.forEach(row => {
        if (row.children.length < 2) return;
        const name = row.children[1].innerText.toLowerCase();
        const email = row.children[2].innerText.toLowerCase();
        const primaryPhone = row.children[3].innerText;
        const secondaryPhone = row.children[4].innerText;
        if (name.includes(filter) || email.includes(filter) || primaryPhone.includes(filter) || secondaryPhone.includes(filter) ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});
document.addEventListener("DOMContentLoaded" , ()=>{
    loadCustomers();
})