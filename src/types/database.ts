
export interface Buyer {
  id: number;
  name: string;
  phone: string;
  document?: string;
  company?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  code: string;
  description: string;
  item_type: string;
  created_at?: string;
}

export interface TareWeight {
  id: number;
  item_type: string;
  tare_kg: number;
  created_at?: string;
}

export interface UnitPrice {
  id: number;
  item_type: string;
  price: number;
  created_at?: string;
}

export interface Weighing {
  id: number;
  buyer_id: number;
  total_weight_kg: number;
  total_price: number;
  created_at: string;
}

export interface WeighingEntry {
  id: number;
  weighing_id: number;
  item_type: string;
  product_id?: number;
  gross_weight_kg: number;
  tare_kg: number;
  net_weight_kg: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface WeighingEntryForm {
  id: string;
  itemType: string;
  productId?: number | null;
  productDescription?: string;
  grossWeightKg: number;
  tareKg: number;
  netWeightKg: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Settings {
  id: number;
  report_footer1: string;
  report_footer2: string;
}
