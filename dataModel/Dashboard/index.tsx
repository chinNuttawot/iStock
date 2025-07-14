export interface DashboardItem {
  status: string; // เช่น "Pending Approval"
  count: number; // จำนวน
}

export interface DashboardGroup {
  groupName: string; // เช่น "สถานะรับ"
  items: DashboardItem[];
}


