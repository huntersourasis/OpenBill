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
                    document.querySelector(".invoiceCount").innerHTML = data.data;
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
                    document.querySelector(".totalCustomers").innerHTML = data.data;
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
                    document.querySelector(".products").innerHTML = data.data;
                } else
                {
                    showToast(data.msg , "danger");
                }
            });
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
    const ctx = document.getElementById('financeChart').getContext('2d');

    new Chart(ctx, {
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

let labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
let incomeData = [];
let dueData = [];

fetch("/api/home/revenue", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        // You can replace this with real monthly breakdown later
        let totalIncome = Number(data.data.paid.paidAmount);
        let totalDue = Number(data.data.due.totalAmount) - Number(data.data.due.paidAmount);

        // Fake distribution (for now visual effect)
        incomeData = [20, 40, 35, 60, 80, totalIncome];
        dueData = [50, 45, 40, 30, 25, totalDue];

        renderChart(labels, incomeData, dueData);
    }
});