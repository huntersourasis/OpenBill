async function loadSettings() {
    const res = await fetch('/api/settings/read');
    const { data } = await res.json();

    data.forEach(s => {
        Object.keys(s).forEach(k => {
            const el = document.getElementById(k);
            if (!el) return;
            el.type === 'checkbox' ? el.checked = s[k] : el.value = s[k] ?? '';
        });
    });
}

function sectionToTag (section)
{
    switch (section) {
        case 'companysettings':
            return 'Company Settings';
            break;
        case 'billandtax':
            return 'Bill & Tax';
            break;
        case 'userandrole':
            return 'User & Role';
            break;
        case 'system':
            return 'System';
            break;
        case 'security':
            return 'Security';
            break;
        default:
            break;
    }
}

async function update(section, payload) {
    await fetch('/api/settings/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: payload })
    }).then((res)=>{
        return res.json();
    }).then((data)=>{
        if (data.success)
        {
            showToast(`${sectionToTag(section)} updated successfully` , "success");
        } else
        {
            showToast(data.msg , "warning");
        }
    }).catch((err)=>{
        showToast("Internal Error" , "danger");
    });
}

const saveCompany = () => update("companysettings", {
    com_name: com_name.value,
    business_email: business_email.value,
    ph_number: ph_number.value,
    gst_number: gst_number.value,
    address: address.value
});

function validateCompanyDetails(phone, gst, email) {
    const errors = {};
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        errors.phone = "Phone number must be a valid 10-digit number";
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gst)) {
        errors.gst = "GST number must be a valid 15-character alphanumeric value";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        errors.email = "Email address is not valid";
    }


    if(Object.keys(errors).length === 0)
    {
        saveCompany();
    } else
    {
        const errorString = Object.values(errors).join("\n");
        showToast(errorString , "warning");
    }
    

}

const saveBilling = () => update("billandtax", {
    default_tax: default_tax.value,
    invoice_prefix: invoice_prefix.value,
    currency: currency.value,
    automatic_invoice_numbering: automatic_invoice_numbering.checked
});

const saveUser = () => update("userandrole", {
    role: role.value
});

const saveSecurity = () => update("security", {
    session_timeout: session_timeout.value,
    max_login_attempts: max_login_attempts.value
});

const securityValidation= (max_login_attempts , session_timeout) => {
    if(max_login_attempts < 3 || session_timeout < 15)
    {
        showToast("Max Attempt should be > 3 and Session Timeout should be > 15" , "warning");
    } else
    {
        saveSecurity();
    }
}

const saveSystem = () => update("system", {
    time_zone: time_zone.value
});

loadSettings();

document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('main');
    const navLinks = document.querySelectorAll('#settings-nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevents URL change and jump
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Scroll the 'main' container to the element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Refresh Scrollspy when content changes
    const dataSpyList = document.querySelectorAll('[data-bs-spy="scroll"]');
    dataSpyList.forEach(dataSpyEl => {
        bootstrap.ScrollSpy.getInstance(dataSpyEl).refresh();
    });
});