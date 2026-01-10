import loadSettings from "./loadSettings.js";

const formatInvoiceNumber = async (seq, width = 4) => {
  return `${(await loadSettings()).invoicePrefix}-${new Date().getFullYear()}-${String(seq).padStart(width, "0")}`;
};
const formatNumber = (seq, width = 4) => {
  return  `${new Date().getFullYear()}-${String(seq).padStart(width, "0")}`;
};
export {formatInvoiceNumber , formatNumber};