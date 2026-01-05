let toastInstance;
function showToast(message, type = "success") {
    const toastEl = document.getElementById("appToast");
    const toastBody = document.getElementById("toastBody");
    const colorMap = {
        success: "bg-success text-white",
        error: "bg-danger text-white",
        warning: "bg-warning text-dark",
        info: "bg-primary text-white",
        danger: "bg-danger text-white"
    };
    toastEl.className = `toast align-items-center border-0 ${colorMap[type] || colorMap.info}`;
    toastBody.innerText = message;
    if (!toastInstance) {
        toastInstance = new bootstrap.Toast(toastEl, { delay: 3000 });
    }
    toastInstance.show();
}