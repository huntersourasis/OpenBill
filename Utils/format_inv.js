import loadSettings from "./loadSettings.js";

const formatInvoiceNumber = async (seq, width = 4) => {
  return `${(await loadSettings()).invoicePrefix}-${String(seq).padStart(width, "0")}`;
};
const formatNumber = (seq, width = 4) => {
  return String(seq).padStart(width, "0");
};
export {formatInvoiceNumber , formatNumber};