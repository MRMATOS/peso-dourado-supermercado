
import { supabase } from '@/integrations/supabase/client';
import { 
  Buyer, 
  Product, 
  TareWeight, 
  UnitPrice, 
  Weighing, 
  WeighingEntry,
  Settings
} from '@/types/database';

// Buyers
export async function getBuyers() {
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data || [];
}

export async function createBuyer(buyer: Omit<Buyer, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('buyers')
    .insert(buyer)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateBuyer(id: number, buyer: Partial<Buyer>) {
  const { data, error } = await supabase
    .from('buyers')
    .update(buyer)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteBuyer(id: number) {
  const { error } = await supabase
    .from('buyers')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

export async function checkBuyerExists(field: 'name' | 'phone' | 'document', value: string) {
  if (!value) return false;
  
  const { data, error } = await supabase
    .from('buyers')
    .select('id')
    .eq(field, value)
    .maybeSingle();
    
  if (error) throw error;
  return !!data;
}

// Products
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('description');
    
  if (error) throw error;
  return data || [];
}

export async function getProductsByType(itemType: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('item_type', itemType)
    .order('description');
    
  if (error) throw error;
  return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Unit Prices
export async function getUnitPrices() {
  const { data, error } = await supabase
    .from('unit_prices')
    .select('*')
    .order('item_type');
    
  if (error) throw error;
  return data || [];
}

export async function createUnitPrice(unitPrice: Omit<UnitPrice, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('unit_prices')
    .insert(unitPrice)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUnitPrice(id: number, unitPrice: Partial<UnitPrice>) {
  const { data, error } = await supabase
    .from('unit_prices')
    .update(unitPrice)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteUnitPrice(id: number) {
  const { error } = await supabase
    .from('unit_prices')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Tare Weights
export async function getTareWeights() {
  const { data, error } = await supabase
    .from('tare_weights')
    .select('*')
    .order('item_type');
    
  if (error) throw error;
  return data || [];
}

export async function createTareWeight(tareWeight: Omit<TareWeight, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('tare_weights')
    .insert(tareWeight)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateTareWeight(id: number, tareWeight: Partial<TareWeight>) {
  const { data, error } = await supabase
    .from('tare_weights')
    .update(tareWeight)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteTareWeight(id: number) {
  const { error } = await supabase
    .from('tare_weights')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// Weighing History 
export async function getWeighings(options?: {
  startDate?: Date; 
  endDate?: Date;
  buyerId?: number;
}) {
  let query = supabase
    .from('weighings')
    .select(`
      *,
      buyer:buyers(*)
    `)
    .order('created_at', { ascending: false });
    
  if (options?.startDate) {
    const startDateStr = options.startDate.toISOString();
    query = query.gte('created_at', startDateStr);
  }
  
  if (options?.endDate) {
    const endDate = new Date(options.endDate);
    endDate.setDate(endDate.getDate() + 1); // Include the end date
    const endDateStr = endDate.toISOString();
    query = query.lt('created_at', endDateStr);
  }
  
  if (options?.buyerId) {
    query = query.eq('buyer_id', options.buyerId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function getWeighingDetails(weighingId: number) {
  const { data, error } = await supabase
    .from('weighing_entries')
    .select(`
      *,
      product:products(*)
    `)
    .eq('weighing_id', weighingId)
    .order('id');
    
  if (error) throw error;
  return data || [];
}

// Settings
export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .maybeSingle();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateSettings(settings: Partial<Settings>) {
  const { data: existingSettings } = await supabase
    .from('settings')
    .select('id')
    .maybeSingle();
    
  let result;
  
  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', existingSettings.id)
      .select()
      .single();
      
    if (error) throw error;
    result = data;
  } else {
    // Insert new settings
    const { data, error } = await supabase
      .from('settings')
      .insert(settings)
      .select()
      .single();
      
    if (error) throw error;
    result = data;
  }
  
  return result;
}
