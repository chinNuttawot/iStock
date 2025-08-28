import mitt from "mitt";

export const emitter = mitt();

//ScanIn
export const filterScanIn = "on-filter-scanIn";
export const filterScanInDetail = "on-filter-scanIn-detail";
export const getDataScanIn = "on-get-Data-ScanIn";

//ScanOut
export const filterScanOut = "on-filter-scanOut";
export const filterScanOutDetail = "on-filter-scanOut-detail";
export const filterCreateDocumentScanOut = "on-Create-Document-ScanOut";
export const getDataScanOut = "on-get-Data-ScanOut";

//Transfer
export const filterTransfer = "on-filter-Transfer";
export const filterTransferDetail = "on-filter-Transfer-detail";
export const getDataTransfer = "on-get-Data-Transfer";

//StockCheck
export const filterStockCheck = "on-filter-StockCheck";
export const filterStockCheckDetail = "on-filter-StockCheck-detail";
export const filterCreateDocumentStockCheck = "on-Create-Document-StockCheck";
export const getDataStockCheck = "on-get-Data-StockCheck";

//TransactionHistory
export const filterTransactionHistory = "on-filter-TransactionHistory";
export const filterTransactionHistoryDetail =
  "on-filter-TransactionHistory-detail";

//Approve
export const filterApprove = "on-filter-Approve";
export const filterApproveDetail = "on-filter-Approve-detail";
