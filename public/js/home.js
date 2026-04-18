let financeChartInstance = null;
function animateNumber(element, target, duration = 1200) {
    let start = 0;
    const increment = target / (duration / 16); // ~60fps

    function update() {
        start += increment;

        if (start >= target) {
            element.innerHTML = Math.floor(target);
        } else {
            element.innerHTML = Math.floor(start);
            requestAnimationFrame(update);
        }
    }

    update();
}
document.addEventListener("DOMContentLoaded" , ()=>{
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
                    animateNumber(document.querySelector(".invoiceCount"), data.data);
                } else
                {
                    showToast(data.msg , "danger");
                }
            });
            fetch("/api/home/customer" , {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                }
            }).then((res)=>{
                return res.json();
            }).then((data)=>{
                if(data.success)
                {
                    animateNumber(document.querySelector(".totalCustomers"), data.data);
                } else
                {
                    showToast(data.msg , "danger");
                }
            });
            fetch("/api/home/product" , {
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                }
            }).then((res)=>{
                return res.json();
            }).then((data)=>{
                if(data.success)
                {
                    animateNumber(document.querySelector(".products"), data.data);
                } else
                {
                    showToast(data.msg , "danger");
                }
            });

            fetch("/api/home/revenue", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                
                    // ====== COMMON DATA ======
                    let revenue = Number(data.data.paid.totalAmount) + Number(data.data.due.totalAmount);
                    let recivedPayment = Number(data.data.paid.paidAmount) + Number(data.data.due.paidAmount);
                    let dueAmount = revenue - recivedPayment;
                
                    // ====== UPDATE UI (WITH ANIMATION IF YOU ADDED IT) ======
                    animateNumber(document.querySelector(".revenue"), revenue);
                    animateNumber(document.querySelector(".paymentRecived"), recivedPayment);
                    animateNumber(document.querySelector(".pendingDues"), dueAmount);
                
                    // ====== CHART DATA ======
                    let labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                    let totalIncome = Number(data.data.paid.paidAmount);
                    let totalDue = Number(data.data.due.totalAmount) - Number(data.data.due.paidAmount);
                
                    // Temporary distribution (same as your logic)
                    let incomeData = [20, 40, 35, 60, 80, totalIncome];
                    let dueData = [50, 45, 40, 30, 25, totalDue];
                
                    setTimeout(() => {
                        renderChart(labels, incomeData, dueData);
                    }, 150);
                
                } else {
                    showToast(data.msg, "danger");
                }
            });

            document.querySelector(".recent1").innerHTML = localStorage.getItem("recent1") || "No Activity";
            document.querySelector(".recent2").innerHTML = localStorage.getItem("recent2") ;
            document.querySelector(".recent3").innerHTML = localStorage.getItem("recent3") ;
            if (localStorage.getItem("confirmLogin"))
            {
                const toastLiveExample = document.getElementById('liveToastSuccess');
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
                document.querySelector(".successMsg").innerHTML = `Welcome ${document.getElementById("fullname").value}`;
                toastBootstrap.show();
                setTimeout(()=>{
                    localStorage.removeItem("confirmLogin");
                    toastBootstrap.hide();
                } , 1500);
            }
});

function renderChart(labels, incomeData, dueData) {
    const canvas = document.getElementById('financeChart');

    if (!canvas) {
        console.error("Canvas not found");
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy previous chart
    if (financeChartInstance) {
        financeChartInstance.destroy();
    }

    financeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.15)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4
                },
                {
                    label: 'Dues',
                    data: dueData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // important
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0,0,0,0.05)"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

