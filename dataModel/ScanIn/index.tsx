export interface DetailItem {
  label: string;
}

export interface DocumentItem {
  id: string;
  docId: string;
  status: "Open" | "Approved" | "Pending Approval" | "Rejected";
  details: DetailItem[];
}
