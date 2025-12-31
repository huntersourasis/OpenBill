function getCurrentDate() {
    const date = new Date();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; 
    hours = String(hours).padStart(2, '0');

    const day = date.getDate();
    const year = date.getFullYear();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];

    function getOrdinal(n) {
        if (n > 3 && n < 21) return "th";
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }
    return `${hours}:${minutes} ${period} - ${day}${getOrdinal(day)} ${month} , ${year}`;
}

export default getCurrentDate;