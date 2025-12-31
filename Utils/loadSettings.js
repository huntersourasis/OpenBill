import settingsModal from "../Modals/settingsModal.js";
import {
    defaultCSM,
    defaultBTM,
    defaultURM,
    defaultSECM,
    defaultSYSM
} from "./settings.js";


const loadSettings = async () => {
    const [
        companySettings,
        billAndTax,
        userAndRole,
        security,
        system
    ] = await Promise.all([
        settingsModal.findOne({ section: defaultCSM.section }).lean(),
        settingsModal.findOne({ section: defaultBTM.section }).lean(),
        settingsModal.findOne({ section: defaultURM.section }).lean(),
        settingsModal.findOne({ section: defaultSECM.section }).lean(),
        settingsModal.findOne({ section: defaultSYSM.section }).lean()
    ]);

    return {

        companyName: companySettings?.com_name ?? defaultCSM.com_name,
        businessEmail: companySettings?.business_email ?? defaultCSM.business_email,
        phoneNumber: companySettings?.ph_number ?? defaultCSM.ph_number,
        gstNumber: companySettings?.gst_number ?? defaultCSM.gst_number,
        address: companySettings?.address ?? defaultCSM.address,


        defaultTax: billAndTax?.default_tax ?? defaultBTM.default_tax,
        invoicePrefix: billAndTax?.invoice_prefix ?? defaultBTM.invoice_prefix,
        currency: billAndTax?.currency ?? defaultBTM.currency,
        automaticInvoiceNumbering:
            billAndTax?.automatic_invoice_numbering
            ?? defaultBTM.automatic_invoice_numbering,


        defaultRole: userAndRole?.default_role ?? defaultURM.default_role,
        allowRoleChange:
            userAndRole?.allow_role_change ?? defaultURM.allow_role_change,


        sessionTimeout:
            security?.session_timeout ?? defaultSECM.session_timeout,
        maxLoginAttempts:
            security?.max_login_attempts ?? defaultSECM.max_login_attempts,


        timeZone: system?.time_zone ?? defaultSYSM.time_zone,
        dateFormat: system?.date_format ?? defaultSYSM.date_format,
        timeFormat: system?.time_format ?? defaultSYSM.time_format
    };
};

export default loadSettings;
