export interface EarningsTransaction {
  id: string; orderId: number; paymentReference: string; gateway: string;
  itemTitle: string; itemImage: string; sellerId: number | null; sellerName: string; buyerName: string;
  type: "thrift" | "rent"; grossAmount: number; commissionRate: number;
  platformCut: number; sellerShare: number; date: string; source: string;
}
export interface EarningsDashboard {
  metrics: { totalGMV: number; thriftGMV: number; rentGMV: number; thriftCommission: number;
    rentCommission: number; totalCommission: number; sellerShare: number; verifiedCollections: number; excludedCharges: number };
  monthly: { month: string; thriftComm: number; rentComm: number }[];
  transactions: EarningsTransaction[];
  totalElements: number; page: number; size: number;
  reviewIssues: { reference: string; orderId: number; reason: string }[];
  reviewCount: number;
}
