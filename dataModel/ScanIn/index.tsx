export interface DetailItem {
  label: string;
}

export interface DocumentItem {
  id: string;
  docNo: string;
  status: "Open" | "Approved" | "Pending Approval" | "Rejected";
  details: DetailItem[];
}
