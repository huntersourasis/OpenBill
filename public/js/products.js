const categoryInput = document.getElementById("category");
const categoryList = document.getElementById("categoryList");
const addCategoryBtn = document.querySelector(".addCategoryBtn");
function loadCategories() {
    fetch("/api/products/category/read",
        {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            }
        }
    )
        .then(res => res.json())
        .then(data => {
            categoryList.innerHTML = "";
            if (!data.success || !data.data.length) {
                categoryList.innerHTML = `
                    <li class="list-group-item text-muted text-center">
                        No categories found
                    </li>`;
                return;
            }
            data.data.forEach(cat => {
                categoryList.insertAdjacentHTML("beforeend", `
                    <li class="list-group-item d-flex align-items-center">
                        <input 
                            type="text"
                            class="form-control flex-grow-1 me-2"
                            value="${cat.category}"
                            readonly
                        >
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-warning"
                                onclick="editCategory('${cat._id}', this)">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger"
                                onclick="deleteCategory('${cat._id}')">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    </li>
                `);
            });
        })
        .catch(err => {
            showToast("Failed to load categories", "danger");
            console.error(err);
        });
}
addCategoryBtn.addEventListener("click", e => {
    e.preventDefault();
    if (!categoryInput.value.trim()) {
        showToast("Category name required", "warning");
        return;
    }
    fetch("/api/products/category/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryInput.value.toUpperCase() })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.msg, "success");
            categoryInput.value = "";
            loadCategories(); // refresh list
            loadSkuCategories();
        } else {
            showToast(data.msg, "warning");
        }
    })
    .catch(err => {
        showToast("Server error", "danger");
        console.error(err);
    });
});
let deleteCategoryId = null;
function deleteCategory(id) {
    deleteSkuRuleId = null;
    deleteProductId = null;
    deleteCategoryId = id;
    document.querySelector("#confirmDeleteModal .modal-title")
        .innerHTML = `<i class="fa fa-triangle-exclamation me-1"></i> Confirm Category Deletion`;
    document.querySelector("#confirmDeleteModal .modal-body").innerHTML = `
        <p class="mb-0">
            This will permanently delete the category.
            <br>
            <strong>Products and Sku Rules using this category may be affected.</strong>
        </p>
    `;
    const modal = new bootstrap.Modal(
        document.getElementById("confirmDeleteModal")
    );
    modal.show();
}
document.getElementById("confirmDeleteBtn").addEventListener("click", () => {

    // CATEGORY DELETE
    if (deleteCategoryId) {
        fetch(`/api/products/category/delete/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deleteCategoryId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.msg, "success");
                callDB();
            } else {
                showToast(data.msg, "warning");
            }
        });
    
        deleteCategoryId = null;
    }

    // SKU RULE DELETE
    if (deleteSkuRuleId) {
        fetch("/api/products/sku/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deleteSkuRuleId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.msg, "success");
                loadProductSkuRules();
                loadSkuRules();
                loadProducts();
            } else {
                showToast(data.msg, "warning");
            }
        });
    
        deleteSkuRuleId = null;
    }
    // Product Delete
    if (deleteProductId) {
        fetch("/api/products/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deleteProductId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.msg, "success");
                loadProducts();
            } else {
                showToast(data.msg, "warning");
            }
        });
    
        deleteProductId = null;
    }
    bootstrap.Modal.getInstance(
        document.getElementById("confirmDeleteModal")
    ).hide();
});
function editCategory(id, btn) {
    const input = btn.closest("li").querySelector("input");
    if (input.hasAttribute("readonly")) {
        input.removeAttribute("readonly");
        input.focus();
        btn.innerHTML = `<i class="fa fa-save"></i>`;
        btn.classList.replace("btn-outline-warning", "btn-outline-success");
    } else {
        fetch(`/api/products/category/update/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id : id , category: input.value.toUpperCase() })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.msg, "success");
                callDB();
                input.setAttribute("readonly", true);
                btn.innerHTML = `<i class="fa fa-edit"></i>`;
                btn.classList.replace("btn-outline-success", "btn-outline-warning");
            } else {
                showToast(data.msg, "warning");
            }
        });
    }
}
// SKU
const skuCategorySelect = document.getElementById("skuCategory");
const skuPrefixInput = document.getElementById("skuPrefix");
const saveSkuRuleBtn = document.getElementById("saveSkuRuleBtn");
const skuRuleList = document.getElementById("skuRuleList");
function loadSkuCategories() {
    fetch("/api/products/category/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        skuCategorySelect.innerHTML = `<option value="">Select Category</option>`;
        if (!data.success) return;
        data.data.forEach(cat => {
            skuCategorySelect.insertAdjacentHTML("beforeend", `
                <option value="${cat.category}">
                    ${cat.category}
                </option>
            `);
        });
    });
}
saveSkuRuleBtn.addEventListener("click", () => {
    const categoryId = skuCategorySelect.value;
    const prefix = skuPrefixInput.value.trim().toUpperCase();
    if (!categoryId || !prefix) {
        showToast("Category and Prefix are required", "warning");
        return;
    }
    fetch("/api/products/sku/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category : categoryId,
            sku_prefix : prefix
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.msg, "success");
            skuPrefixInput.value = "";
            skuCategorySelect.value = "";
            loadSkuRules();
            loadProductSkuRules();
        } else {
            showToast(data.msg, "warning");
        }
    })
    .catch(() => {
        showToast("Server error", "danger");
    });
});
function editSkuRule(id, btn) {
    const input2 = btn.closest("li").querySelector("#sku_perfix input");
    if (input2.hasAttribute("readonly")) {
        input2.removeAttribute("readonly");
        input2.focus();
        btn.innerHTML = `<i class="fa fa-save"></i>`;
        btn.classList.replace("btn-outline-warning", "btn-outline-success");
    } else {
        fetch(`/api/products/sku/update/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id : id , sku_prefix: input2.value.toUpperCase() })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.msg, "success");
                callDB();
                input2.setAttribute("readonly", true);
                btn.innerHTML = `<i class="fa fa-edit"></i>`;
                btn.classList.replace("btn-outline-success", "btn-outline-warning");
            } else {
                showToast(data.msg, "warning");
            }
        });
    }
}
function loadSkuRules() {
    fetch("/api/products/sku/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        skuRuleList.innerHTML = "";
        if (!data.success || !data.data.length) {
            skuRuleList.innerHTML = `
                <li class="list-group-item text-muted text-center">
                    No SKU rules found
                </li>`;
            return;
        }
        data.data.forEach(rule => {
            skuRuleList.insertAdjacentHTML("beforeend", `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div id="category">
                    <input 
                        type="text"
                        class="form-control flex-grow-1 me-2"
                        value="${rule.category}"
                        readonly
                    >
                    </div>
                    → <span class="me-2"></span>
                    <div class="me-3" id="sku_perfix">
                    <input 
                        type="text"
                        class="form-control flex-grow-1 me-2"
                        value="${rule.sku_prefix}"
                        id="sku_perfix"
                        readonly
                    > 
                    </div>
                    <div>
                    <div class="btn-group ">
                        <button class="btn btn-sm btn-outline-warning"
                            onclick="editSkuRule('${rule._id}', this)">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger"
                            onclick="deleteSkuRule('${rule._id}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                    </div>
                </li>
            `);
        });
    });
}
let deleteSkuRuleId = null;
function deleteSkuRule(id) {
    deleteCategoryId = null;
    deleteProductId = null;
    deleteSkuRuleId = id;
    document.querySelector("#confirmDeleteModal .modal-title")
        .innerHTML = `<i class="fa fa-triangle-exclamation me-1"></i> Confirm SKU Rule Deletion`;
    document.querySelector("#confirmDeleteModal .modal-body").innerHTML = `
        <p class="mb-0">
            This will permanently delete the SKU rule.
            <br>
            <strong>Products using this rule may be affected.</strong>
        </p>
    `;
    const modal = new bootstrap.Modal(
        document.getElementById("confirmDeleteModal")
    );
    modal.show();
}
const productSkuRule = document.getElementById("productSkuRule");
function loadProductSkuRules() {
    fetch("/api/products/sku/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        productSkuRule.innerHTML = `<option value="">Select SKU Rule</option>`;
        if (!data.success) return;
        data.data.forEach(rule => {
            productSkuRule.insertAdjacentHTML("beforeend", `
                <option value="${rule.category}!@#$%^&*()${rule.sku_prefix}">
                    ${rule.category} → ${rule.sku_prefix}
                </option>
            `);
        });
    });
}
document.getElementById("saveProductBtn").addEventListener("click", () => {
    const payload = {
        name: document.querySelector("[name='name']").value.trim().toUpperCase(),
        sku: productSkuRule.value.split("!@#$%^&*()")[1],
        category : productSkuRule.value.split("!@#$%^&*()")[0],
        price: document.querySelector("[name='price']").value,
        stock: document.querySelector("[name='stock']").value,
        tax: document.querySelector("[name='tax']").value,
        warrantyMonths : document.querySelector("[name='warranty']").value,
        description: document.querySelector("textarea").value.trim(),
        createdBy : "<%= payload.email %>" 
    };
    if (!payload.name || !payload.sku) {
        showToast("Product name and SKU rule are required", "warning");
        return;
    }
    fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.msg, "success");
            loadProducts();
            bootstrap.Modal.getInstance(
                document.getElementById("productModal")
            ).hide();
        } else {
            showToast(data.msg, "warning");
        }
    })
    .catch(() => {
        showToast("Server error", "danger");
    });
});
const productTableBody = document.getElementById("productTableBody");
function loadProducts() {
    fetch("/api/products/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        productTableBody.innerHTML = "";
        if (!data.success || !data.data.length) {
            document.getElementById("totalProducts").innerHTML = 0;
            document.getElementById("activeProducts").innerHTML = 0;
            document.getElementById("outOfStock").innerHTML = 0;
            productTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        No products found
                    </td>
                </tr>`;
            return;
        }
        let totalProducts = data.data.length;
        document.getElementById("totalProducts").innerHTML = totalProducts;
        let activeProducts = 0;
        data.data.forEach((e)=>{
            if(e.isActive)
            {
                activeProducts += 1;
            }
        })
        document.getElementById("activeProducts").innerHTML = activeProducts;
        let outOfStock = 0;
        data.data.forEach((e)=>{
            if(e.stock < 1)
            {
                outOfStock += 1;
            }
        })
        document.getElementById("outOfStock").innerHTML = outOfStock;
        data.data.forEach((p, i) => {
            productTableBody.insertAdjacentHTML("beforeend", `
                <tr class='text-center'>
                    <td>${i + 1}</td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>${p.sku}</td>
                    <td>${p.warrantyMonths}</td>
                    <td>₹ ${p.price}</td>
                    <td>${p.tax} %</td>
                    <td>${p.stock} ${p.stock === 1 ? 'pc' : 'pcs'}</td>
                    <td>
                        <span class="badge bg-${p.isActive === true ? "success" : "secondary"}">
                            ${p.isActive ? 'Active' : 'Disabled'}
                        </span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-warning"
                            onclick="editProduct('${p._id}')">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger"
                            onclick="deleteProduct('${p._id}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    })
    .catch(() => {
        showToast("Failed to load products", "danger");
    });
}
function editProduct(id) {
    document.getElementById("productModal").querySelector(".modal-title").textContent = "Edit Product";
    fetch("/api/products/read-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }) 
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            showToast("Failed to fetch product", "warning");
            return;
        }
        const p = data.data; 
        const modal = new bootstrap.Modal(document.getElementById("productModal"));
        
        modal.show();
        
        const modalEl = document.getElementById("productModal");
        modalEl.querySelector("[name='productId']").value = p._id;
        modalEl.querySelector("[name='name']").value = p.name.toUpperCase();
        modalEl.querySelector("[name='price']").value = p.price;
        modalEl.querySelector("[name='stock']").value = p.stock;
        modalEl.querySelector("[name='tax']").value = p.tax;
        modalEl.querySelector("[name='warranty']").value = p.warrantyMonths;
        modalEl.querySelector("textarea").value = p.description;
        productSkuRule.value = `${p.category}!@#$%^&*()${p.sku}`;
        modalEl.querySelector("#saveProductBtn").classList.add("d-none");
        modalEl.querySelector("#updateProductBtn").classList.remove("d-none");
        
    });
}
document.getElementById("updateProductBtn").addEventListener("click", () => {
    const modalEl = document.getElementById("productModal");
    const payload = {
        id: modalEl.querySelector("[name='productId']").value,
        name: modalEl.querySelector("[name='name']").value.trim(),
        sku: productSkuRule.value.split("!@#$%^&*()")[1],
        category: productSkuRule.value.split("!@#$%^&*()")[0],
        price: modalEl.querySelector("[name='price']").value,
        stock: modalEl.querySelector("[name='stock']").value,
        tax: modalEl.querySelector("[name='tax']").value,
        warrantyMonths: modalEl.querySelector("[name='warranty']").value,
        description: modalEl.querySelector("textarea").value.trim()
    };
    
    if (!payload.name || !payload.sku) {
        showToast("Product name and SKU rule are required", "warning");
        return;
    }
    fetch("/api/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.msg, "success");
            bootstrap.Modal.getInstance(modalEl).hide();
            loadProducts();
            modalEl.querySelector("#saveProductBtn").classList.remove("d-none");
            modalEl.querySelector("#updateProductBtn").classList.add("d-none");
        } else {
            showToast(data.msg, "warning");
        }
    })
    .catch(() => showToast("Server error", "danger"));
});
let deleteProductId = null;
// Delete Product
function deleteProduct(id) {
    deleteSkuRuleId = null; 
    deleteCategoryId = null; 
    document.querySelector("#confirmDeleteModal .modal-title")
        .innerHTML = `<i class="fa fa-triangle-exclamation me-1"></i> Confirm Product Deletion`;
    document.querySelector("#confirmDeleteModal .modal-body").innerHTML = `
        <p class="mb-0">
            This action will permanently delete the product.
            <br>
            <strong>Are you sure you want to continue?</strong>
        </p>
    `;
    deleteProductId = id; 
    const modal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    modal.show();
}
function resetProductModal() {
    const modal = document.getElementById("productModal");
    modal.querySelector("[name='productId']").value = "";
    modal.querySelector("[name='name']").value = "";
    modal.querySelector("[name='price']").value = "";
    modal.querySelector("[name='stock']").value = "";
    modal.querySelector("[name='tax']").value = "<%= settings.defaultTax %>";
    modal.querySelector("[name='warranty']").value = 1;
    modal.querySelector("textarea").value = "";
    productSkuRule.value = "";
    modal.querySelector("#saveProductBtn").classList.remove("d-none");
    modal.querySelector("#updateProductBtn").classList.add("d-none");
    modal.querySelector(".modal-title").textContent = "Add Product";
}
document.getElementById("addProductBtn").addEventListener("click", () => {
    resetProductModal();
});
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#productTableBody tr");
    rows.forEach(row => {
        if (row.children.length < 2) return;
        const name = row.children[1].innerText.toLowerCase();
        const category = row.children[2].innerText.toLowerCase();
        const sku = row.children[3].innerText.toLowerCase();
        if (name.includes(filter) || category.includes(filter) || sku.includes(filter) ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});
function callDB()
{
    loadCategories();
    loadSkuCategories();
    loadSkuRules();
    loadProductSkuRules();
    loadProducts();
}
document.addEventListener("DOMContentLoaded", () => {
    callDB();
});