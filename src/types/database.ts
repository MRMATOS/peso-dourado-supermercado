
export interface Buyer {
  id: string;
  name: string;
  phone: string;
  document?: string | null;
  company?: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  code: string;
  description: string;
  item_type: string;
  created_at?: string;
}

export interface TareWeight {
  id: string;
  item_type: string;
  tare_kg: number;
  created_at?: string;
}

export interface UnitPrice {
  id: string;
  item_type: string;
  price: number;
  created_at?: string;
}

export interface Weighing {
  id: string;
  buyer_id: string;
  total_kg: number; // Changed from total_weight_kg to match database
  total_price: number;
  created_at: string;
  tab_name: string; // Added to match database
  report_date: string; // Added to match database
}

export interface WeighingEntry {
  id: string;
  weighing_id: string;
  item_type: string;
  product_id?: string | null;
  gross_weight: number; // Changed from gross_weight_kg to match database
  tare_used: number; // Changed from tare_kg to match database
  net_weight: number; // Changed from net_weight_kg to match database
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface WeighingEntryForm {
  id: string;
  itemType: string;
  productId?: string | null; // Changed from number to string
  productDescription?: string;
  grossWeightKg: number;
  tareKg: number;
  netWeightKg: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Settings {
  id: string;
  report_footer1: string;
  report_footer2: string;
  tab1_name?: string;
  tab2_name?: string;
  detailed_report?: boolean;
}
