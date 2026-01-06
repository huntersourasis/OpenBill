const tbody = document.getElementById("usersTableBody");
function showData()
{
    fetch("/api/users/read" , {
    method : "POST",
    headers : {
        "Content-Type" : "application/json"
    }
})
    .then(res => res.json())
    .then(({ success, data }) => {
        tbody.innerHTML = "";
        if (!success || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">No users found</td>
                </tr>`;
            return;
        }
        data.forEach((u, i) => {
            const roleColor = u.role === "admin" ? "primary" :
                              u.role === "user" ? "secondary" : "warning";
            const statusColor = u.status === true ? "success" : "danger";
            const actionsBtns = `<button class="btn btn-sm btn-outline-secondary"
                            data-bs-toggle="modal"
                            data-bs-target="#statusUserModal"
                            data-id="${u._id}"
                            data-status="${u.status}">
                            <i class="fa fa-power-off"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger"
                            data-bs-toggle="modal"
                            data-bs-target="#deleteUserModal"
                            data-id="${u._id}">
                            <i class="fa fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning"
                            data-bs-toggle="modal"
                            data-bs-target="#updateUserModal"
                            data-id="${u._id}"
                            data-name="${u.fullname}"
                            data-email="${u.email}"
                            data-role="${u.role}"
                            data-status="${u.status === true ? 'active' : 'disabled'}">
                            <i class="fa fa-edit"></i>
                        </button>
                        `;
            const adminActionBtn = `
                        <button class="btn btn-sm btn-outline-success" onclick="changeBtn()">
                            <i class="fa fa-edit"></i> Change
                        </button>
            `;
            tbody.innerHTML += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${u.fullname}</td>
                    <td>${u.email}</td>
                    <td><span class="badge bg-${roleColor}">${u.role.toUpperCase()}</span></td>
                    <td>${u.lastlogin ? u.lastlogin : "—"}</td>
                    <td><span class="badge bg-${statusColor}">${u.status ? 'ACTIVE' : 'DISABLED'}</span></td>
                    <td class="text-end">
                        ${ u.role != 'admin' ? actionsBtns : adminActionBtn}
                    </td>
                </tr>`;
        });
    });
}
function changeBtn ()
{
    showToast("Currently Under Development" , "info");
}
document.getElementById("updateUserModal")
    .addEventListener("show.bs.modal", e => {
        const b = e.relatedTarget;
        updateUserId.value = b.dataset.id;
        updateUserName.value = b.dataset.name;
        document.getElementById("updateModalHead").innerHTML = b.dataset.name;
        updateUserEmail.value = b.dataset.email;
        updateUserRole.value = b.dataset.role;
        updateUserStatus.value = b.dataset.status;
    });
document.getElementById("deleteUserModal")
    .addEventListener("show.bs.modal", e => {
        deleteUserId.value = e.relatedTarget.dataset.id;
    });
document.getElementById("statusUserModal")
    .addEventListener("show.bs.modal", e => {
        const b = e.relatedTarget;
        const current = b.dataset.status === 'true' ? 'active' : 'disabled';
        statusUserId.value = b.dataset.id;
        statusUserValue.value = current == 'active' ? "disabled" : "active";
        statusActionText.innerText = current == 'active' ? "deactivate" : "activate";
});
function generatePassword(length) {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Password length must be a positive integer");
    }
    const charPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const regex = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]$/;

    let password = '';
    while (password.length < length) {
        const char = charPool.charAt(Math.floor(Math.random() * charPool.length));
        if (regex.test(char)) {
            password += char;
        }
    }
    return password;
}
const c_fullname = document.querySelector(".c_fullname");
const c_email = document.querySelector(".c_email");
const c_role = document.querySelector(".c_role");
const c_status = document.querySelector(".c_status");
const c_password = document.querySelector(".c_password");

document.addEventListener("DOMContentLoaded" , ()=>{
    showData();
    c_password.value = generatePassword(10);   
})
const createUserBtn = document.querySelector(".createBtn");
createUserBtn.addEventListener("click" , (e)=>{
    e.preventDefault();
    fetch("/api/users/create" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            fullname : c_fullname.value,
            email : c_email.value.toLowerCase(),
            role : c_role.value,
            status : c_status.value == 'active' ? true : false,
            password : c_password.value
        })
    }).then((res)=>{
        return res.json();
    }).then((data)=>{
        if(data.success)
        {   
            showToast(data.msg , "success");
            c_password.value = generatePassword(10);
            document.querySelector(".c_cancel").click();
            showData();
        } else
        {
            showToast(data.msg , "warning");
        }
    }).catch((err)=>{
        showToast(err , "danger");
    })
})

const deleteBtn = document.querySelector(".deleteBtn");
deleteBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("deleteUserId").value;
    if (!userId) return;

    try {
        const res = await fetch("/api/users/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: userId })
        });
    
        const data = await res.json();
    
        if (data.success) {
            const modalEl = document.getElementById("deleteUserModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            showData();
        } else {
            alert("Error: " + data.msg);
        }
    
    } catch (err) {
        console.error(err);
        alert("Something went wrong while deleting user");
    }
});
const statusBtn = document.querySelector(".statusBtn");
statusBtn.addEventListener("click" , (e)=>{
    e.preventDefault();
    const userId = document.getElementById("statusUserId").value;
    fetch("/api/users/update-status" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            id : userId
        })
    })
    .then((res)=>{return res.json})
    .then((data)=>{
        const modalEl = document.getElementById("statusUserModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        showData();
    }).catch((err)=>{
        alert(err);
    })
})
const updateBtn = document.querySelector(".updateBtn");
updateBtn.addEventListener("click" , (e)=>{
    e.preventDefault();
    const mongoid = document.getElementById("updateUserId").value;
    const fullname = document.getElementById("updateUserName").value;
    const email = document.getElementById("updateUserEmail").value;
    const role = document.getElementById("updateUserRole").value;
    const status = document.getElementById("updateUserStatus").value === 'active' ? true : false;
    const password = document.getElementById("updateUserPassword").value;
    fetch("/api/users/update" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            id : mongoid,
            fullname : fullname,
            email : email.toLowerCase(),
            role : role,
            status : status,
            password : password
        })
    }).then((res)=>{
        return res.json();
    }).then((data)=>{
        if(data.success)
        {
            const modalEl = document.getElementById("updateUserModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            showToast(data.msg , "success");
            showData();
        } else
        {
            showToast(data.msg , "warning");
        }
    }).catch((err)=>{
        showToast(data.msg , "danger");
    })
})
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#usersTableBody tr");
    rows.forEach(row => {
        if (row.children.length < 2) return;
        const name = row.children[1].innerText.toLowerCase();
        const email = row.children[2].innerText.toLowerCase();
        if (name.includes(filter) || email.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});