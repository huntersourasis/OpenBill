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
            document.querySelector(".recent2").innerHTML = localStorage.getItem("recent2") || "No Activity";
            document.querySelector(".recent3").innerHTML = localStorage.getItem("recent3") || "No Activity";
});