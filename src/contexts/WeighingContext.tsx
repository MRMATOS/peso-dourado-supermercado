
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  UnitPrice,
  TareWeight,
  Product,
  Buyer,
  WeighingEntry,
  Weighing,
  Settings,
  WeighingEntryForm
} from '@/types/database';

interface WeighingContextType {
  // Data lists
  itemTypes: string[];
  products: Product[];
  buyers: Buyer[];
  tarifsById: Record<string, number>;
  pricesById: Record<string, number>;
  
  // Current weighing entries
  currentEntries: WeighingEntryForm[];
  addEntry: (entry: Omit<WeighingEntryForm, 'id' | 'createdAt'>) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  
  // Entry sorting
  sortOrder: 'newest' | 'oldest';
  toggleSortOrder: () => void;
  
  // Settings
  settings: Settings | null;
  
  // Saving
  saveWeighing: (buyerId: string) => Promise<boolean>;
  
  // Loading state
  isLoading: boolean;
  isSaving: boolean;
  
  // New method to add a buyer and get the created buyer
  addBuyer: (buyer: Omit<Buyer, 'id' | 'created_at'>) => Promise<Buyer | null>;
  
  // Refresh data methods
  refreshBuyers: () => Promise<void>;
}

const WeighingContext = createContext<WeighingContextType | undefined>(undefined);

export function WeighingProvider({ children }: { children: ReactNode }) {
  // Data states
  const [itemTypes, setItemTypes] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [tarifsById, setTarifsById] = useState<Record<string, number>>({});
  const [pricesById, setPricesById] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<Settings | null>(null);
  
  // Entries state - Persist current entries in localStorage for navigation
  const [currentEntries, setCurrentEntries] = useState<WeighingEntryForm[]>(() => {
    const savedEntries = localStorage.getItem('currentWeighingEntries');
    if (savedEntries) {
      try {
        // Convert stored string dates back to Date objects
        const parsed = JSON.parse(savedEntries);
        return parsed.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        }));
      } catch (error) {
        console.error('Error parsing saved entries:', error);
        return [];
      }
    }
    return [];
  });
  
  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('currentWeighingEntries', JSON.stringify(currentEntries));
  }, [currentEntries]);
  
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    setIsLoading(true);
    try {
      // Load item types (from unit_prices)
      const { data: unitPrices, error: unitPricesError } = await supabase
        .from('unit_prices')
        .select('*');
        
      if (unitPricesError) throw unitPricesError;
      
      const types = unitPrices.map(up => up.item_type);
      setItemTypes(types);
      
      // Create price map
      const priceMap: Record<string, number> = {};
      unitPrices.forEach(up => {
        priceMap[up.item_type] = up.price;
      });
      setPricesById(priceMap);
      
      // Load tare weights
      const { data: tareWeights, error: tareWeightsError } = await supabase
        .from('tare_weights')
        .select('*');
        
      if (tareWeightsError) throw tareWeightsError;
      
      // Create tare map
      const tareMap: Record<string, number> = {};
      tareWeights.forEach(tw => {
        tareMap[tw.item_type] = tw.tare_kg;
      });
      setTarifsById(tareMap);
      
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
        
      if (productsError) throw productsError;
      setProducts(productsData);
      
      // Load buyers
      const { data: buyersData, error: buyersError } = await supabase
        .from('buyers')
        .select('*')
        .order('name');
        
      if (buyersError) throw buyersError;
      setBuyers(buyersData);
      
      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      setSettings(settingsData || null);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Refresh buyers list
  const refreshBuyers = async () => {
    try {
      const { data: buyersData, error: buyersError } = await supabase
        .from('buyers')
        .select('*')
        .order('name');
        
      if (buyersError) throw buyersError;
      setBuyers(buyersData);
    } catch (error) {
      console.error('Error refreshing buyers:', error);
      toast.error('Erro ao atualizar lista de compradores');
    }
  };
  
  // Add a new buyer and return the created buyer
  const addBuyer = async (buyer: Omit<Buyer, 'id' | 'created_at'>): Promise<Buyer | null> => {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .insert(buyer)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the buyers list
      await refreshBuyers();
      
      return data;
    } catch (error) {
      console.error('Error adding buyer:', error);
      toast.error('Erro ao adicionar comprador');
      return null;
    }
  };
  
  // Add entry
  const addEntry = (entry: Omit<WeighingEntryForm, 'id' | 'createdAt'>) => {
    const newEntry: WeighingEntryForm = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    setCurrentEntries(prev => [newEntry, ...prev]);
  };
  
  // Remove entry
  const removeEntry = (id: string) => {
    setCurrentEntries(prev => prev.filter(entry => entry.id !== id));
  };
  
  // Clear entries
  const clearEntries = () => {
    setCurrentEntries([]);
    localStorage.removeItem('currentWeighingEntries');
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'));
  };
  
  // Get sorted entries
  const sortedEntries = [...currentEntries].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
  });
  
  // Save weighing
  const saveWeighing = async (buyerId: string): Promise<boolean> => {
    if (currentEntries.length === 0) {
      toast.error('Nenhum item para salvar');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate totals
      const totalWeight = currentEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
      const totalPrice = currentEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
      
      // Insert weighing
      const { data: weighingData, error: weighingError } = await supabase
        .from('weighings')
        .insert({
          buyer_id: buyerId,
          total_kg: totalWeight,
          total_price: totalPrice,
          tab_name: settings?.tab1_name || 'Pesagem'
        })
        .select()
        .single();
        
      if (weighingError) throw weighingError;
      
      // Insert weighing entries
      const weighingEntries = currentEntries.map(entry => ({
        weighing_id: weighingData.id,
        item_type: entry.itemType,
        gross_weight: entry.grossWeightKg,
        tare_used: entry.tareKg,
        net_weight: entry.netWeightKg,
        unit_price: entry.unitPrice,
        total_price: entry.totalPrice
      }));
      
      const { error: entriesError } = await supabase
        .from('weighing_entries')
        .insert(weighingEntries);
        
      if (entriesError) throw entriesError;
      
      toast.success('Pesagem salva com sucesso');
      return true;
    } catch (error) {
      console.error('Error saving weighing:', error);
      toast.error('Erro ao salvar pesagem');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <WeighingContext.Provider
      value={{
        itemTypes,
        products,
        buyers,
        tarifsById,
        pricesById,
        currentEntries: sortedEntries,
        addEntry,
        removeEntry,
        clearEntries,
        sortOrder,
        toggleSortOrder,
        settings,
        saveWeighing,
        isLoading,
        isSaving,
        addBuyer,
        refreshBuyers
      }}
    >
      {children}
    </WeighingContext.Provider>
  );
}

export function useWeighing() {
  const context = useContext(WeighingContext);
  if (context === undefined) {
    throw new Error('useWeighing must be used within a WeighingProvider');
  }
  return context;
}
