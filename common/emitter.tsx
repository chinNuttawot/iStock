import mitt from "mitt";

export const emitter = mitt();

//ScanIn
export const filterScanIn = "on-filter-scanIn";
export const filterScanInDetail = "on-filter-scanIn-detail";

//ScanOut
export const filterScanOut = "on-filter-scanOut";
export const filterScanOutDetail = "on-filter-scanOut-detail";

//Transfer
export const filterTransfer = "on-filter-Transfer";
export const filterTransferDetail = "on-filter-Transfer-detail";

//StockCheck
export const filterStockCheck = "on-filter-StockCheck";
export const filterStockCheckDetail = "on-filter-StockCheck-detail";

//TransactionHistory
export const filterTransactionHistory = "on-filter-TransactionHistory";
export const filterTransactionHistoryDetail =
  "on-filter-TransactionHistory-detail";

//Approve
export const filterApprove = "on-filter-Approve";
export const filterApproveDetail = "on-filter-Approve-detail";
