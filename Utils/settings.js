const defaultCSM = {
    section: "companysettings",
    com_name: "OpenBill",
    business_email: "admin@openbill.com",
    ph_number: "9874563210",
    gst_number: "22AAAAA0000A1Z5",
    address: "India"
};

const defaultBTM = {
    section: "billandtax",
    default_tax: 12,
    invoice_prefix: "INV-",
    currency: "INR",
    automatic_invoice_numbering: true
};


const defaultSECM = {
    section: "security",
    session_timeout: 30, // minutes
    max_login_attempts: 5
};


const defaultSYSM = {
    section: "system",
    time_zone: "Asia/Kolkata",
    date_format: "DD MMM YYYY",
    time_format: "12H"
};

const defaultURM = {
    section: "userandrole",
    default_role: "user",
    allow_role_change: true
};

export {
    defaultCSM,
    defaultBTM,
    defaultSECM,
    defaultSYSM,
    defaultURM
};