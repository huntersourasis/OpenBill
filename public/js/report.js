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
function filterReport (from , to , type)
{
    
}