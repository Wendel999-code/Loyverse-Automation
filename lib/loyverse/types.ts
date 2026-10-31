export interface LoyverseCategory {
  id: string;
  name: string;
  color: string;
  created_at: string;
  deleted_at: string | null;
}

export interface LoyverseVariantStore {
  store_id: string;
  pricing_type: string;
  price: number | null;
  available_for_sale: boolean;
  optimal_stock: number | null;
  low_stock: number | null;
}

export interface LoyverseVariant {
  variant_id: string;
  item_id: string;
  sku: string | null;
  reference_variant_id?: string | null;
  option1_value?: string | null;
  option2_value?: string | null;
  option3_value?: string | null;
  barcode?: string | null;
  cost?: number | null;
  purchase_cost?: number | null;
  default_pricing_type?: string;
  default_price?: number | null;
  stores?: LoyverseVariantStore[];
}

export interface LoyverseItem {
  id: string;
  handle?: string;
  item_name: string;
  description?: string | null;
  reference_id?: string | null;
  category_id: string | null;
  track_stock: boolean;
  sold_by_weight?: boolean;
  is_composite?: boolean;
  use_production?: boolean;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  variants: LoyverseVariant[];
}

export interface ReceiptLineItem {
  id: string;
  item_id: string | null;
  variant_id: string | null;
  item_name: string;
  variant_name?: string | null;
  sku?: string | null;
  quantity: number;
  price: number;
  gross_total_money?: number;
  total_money: number;
  cost?: number;
  cost_total?: number;
  total_discount?: number;
}

export interface LoyverseReceipt {
  receipt_number: string;
  receipt_type: "SALE" | "REFUND";
  refund_for: string | null;
  receipt_date: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;

  total_money: number;
  total_tax: number;
  total_discount: number;

  store_id: string;
  employee_id?: string | null;
  pos_device_id?: string | null;

  line_items: ReceiptLineItem[];
}

export interface ItemsResponse {
  items: LoyverseItem[];
  cursor?: string | null;
}

export interface CategoriesResponse {
  categories: LoyverseCategory[];
}

export interface ReceiptsResponse {
  receipts: LoyverseReceipt[];
  cursor?: string | null;
}

export interface DailySales {
  date: string;
  displayDate: string;
  sales: number;
  refunds: number;
  netSales: number;
  transactions: number;
  saleTransactions: number;
  refundTransactions: number;
}

// export interface BranchDashboardResponse {
//   branch: {
//     name: string;
//     code: string;
//   };

//   summary: {
//     totalItems: number;
//     totalCategories: number;
//     totalReceipts: number;
//     totalSales: number;
//     totalRefunds: number;
//     netSales: number;
//   };

//   dailySales: DailySales[];

//   items: LoyverseItem[];
//   categories: LoyverseCategory[];
//   receipts: LoyverseReceipt[];

//   syncedAt: string;
// }

export interface SyncRequest {
  branchName: string;
  branchCode: string;
  token: string;
}

export interface SyncErrorResponse {
  success: false;
  message: string;
  status?: number;
}

export interface BranchDashboardResponse {
  branch: {
    name: string;
    code: string;
  };

  summary: {
    totalItems: number;
    totalCategories: number;
    totalReceipts: number;
    totalSales: number;
    totalRefunds: number;
    netSales: number;
  };

  dailySales: DailySales[];
  items: LoyverseItem[];
  categories: LoyverseCategory[];
  receipts: LoyverseReceipt[];

  syncedAt: string;
}

export interface SyncSuccessResponse
  extends BranchDashboardResponse {
  success: true;
}

export type SyncLoyverseResponse =
  | SyncSuccessResponse
  | SyncErrorResponse;