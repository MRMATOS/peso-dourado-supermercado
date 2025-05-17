
import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NumberInput from '@/components/NumberInput';
import { formatCurrency, formatNumber, parseNumber } from '@/lib/utils';

const WeighingForm = () => {
  const {
    itemTypes,
    products,
    tarifsById,
    pricesById,
    addEntry,
  } = useWeighing();

  // Form state
  const [itemType, setItemType] = useState<string>('');
  const [productId, setProductId] = useState<string | null>(null);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(0);
  const [tareKg, setTareKg] = useState<number>(0);
  const [netWeightKg, setNetWeightKg] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  
  // Ref for the gross weight input so we can focus it after adding
  const grossWeightInputRef = useRef<HTMLInputElement>(null);

  // Filter products by selected item type
  const filteredProducts = products.filter(product => product.item_type === itemType);
  
  // Update tare when item type changes
  useEffect(() => {
    if (itemType) {
      const tare = tarifsById[itemType] || 0;
      setTareKg(tare);
      
      const price = pricesById[itemType] || 0;
      setUnitPrice(price);
    } else {
      setTareKg(0);
      setUnitPrice(0);
    }
    
    // Reset product if item type is not 'Osso'
    if (itemType !== 'Osso') {
      setProductId(null);
    }
  }, [itemType, tarifsById, pricesById]);

  // Calculate net weight and total price when gross weight, tare, or unit price changes
  useEffect(() => {
    const net = Math.max(0, grossWeightKg - tareKg);
    setNetWeightKg(net);
    setTotalPrice(net * unitPrice);
  }, [grossWeightKg, tareKg, unitPrice]);

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!itemType) {
      alert('Selecione um tipo de pesagem');
      return;
    }
    
    if (itemType === 'Osso' && !productId) {
      alert('Selecione um produto');
      return;
    }
    
    if (grossWeightKg <= 0) {
      alert('Informe um peso bruto válido');
      return;
    }
    
    // Find product description
    const selectedProduct = productId ? products.find(p => p.id === productId) : null;
    
    // Add entry
    addEntry({
      itemType,
      productId: selectedProduct?.id || null,
      productDescription: selectedProduct?.description || undefined,
      grossWeightKg,
      tareKg,
      netWeightKg,
      unitPrice,
      totalPrice,
    });
    
    // Only reset the gross weight - keeping itemType and productId
    setGrossWeightKg(0);
    
    // Focus the gross weight input for the next entry
    if (grossWeightInputRef.current) {
      grossWeightInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Pesagem */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Tipo de Pesagem</Label>
              <Select
                value={itemType}
                onValueChange={setItemType}
              >
                <SelectTrigger id="itemType" className="rounded-lg h-9">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Produto (only for Osso) */}
            <div className="space-y-2">
              <Label htmlFor="productId">
                Produto
                {itemType !== 'Osso' && <span className="text-xs text-gray-500 ml-1">(Apenas para Osso)</span>}
              </Label>
              <Select
                value={productId || ''}
                onValueChange={(value) => setProductId(value || null)}
                disabled={itemType !== 'Osso'}
              >
                <SelectTrigger id="productId" className="rounded-lg h-9">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Peso Bruto */}
            <div className="space-y-2">
              <Label htmlFor="grossWeight">Peso Bruto (kg)</Label>
              <NumberInput
                id="grossWeight"
                value={grossWeightKg}
                onChange={setGrossWeightKg}
                decimalPlaces={2}
                placeholder="0,00"
                className="input-weight"
                suffix="kg"
                clearOnFocus
                ref={grossWeightInputRef}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Tara */}
            <div className="space-y-2">
              <Label htmlFor="tare">Tara (kg)</Label>
              <NumberInput
                id="tare"
                value={tareKg}
                onChange={setTareKg}
                decimalPlaces={2}
                placeholder="0,00"
                suffix="kg"
                disabled={!itemType}
              />
            </div>

            {/* Peso Líquido (calculated) */}
            <div className="space-y-2">
              <Label htmlFor="netWeight">Peso Líquido (kg)</Label>
              <NumberInput
                id="netWeight"
                value={netWeightKg}
                onChange={() => {}} // Read-only
                decimalPlaces={2}
                suffix="kg"
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Preço Unitário */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Preço por kg</Label>
              <NumberInput
                id="unitPrice"
                value={unitPrice}
                onChange={setUnitPrice}
                decimalPlaces={2}
                prefix="R$"
                disabled={!itemType}
                className={!itemType ? "bg-gray-50" : ""}
              />
            </div>

            {/* Preço Total with Add Button on same row */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="totalPrice">Preço Total</Label>
              <div className="flex items-center gap-4">
                <div className="w-1/4 md:w-1/6">
                  <NumberInput
                    id="totalPrice"
                    value={totalPrice}
                    onChange={() => {}} // Read-only
                    decimalPlaces={2}
                    prefix="R$"
                    disabled
                    className="bg-gray-50 font-bold text-emerald-600"
                  />
                </div>
                <div className="flex-1 flex justify-end">
                  <Button 
                    type="submit" 
                    className="px-6 whitespace-nowrap"
                    size="sm"
                    disabled={!itemType || grossWeightKg <= 0 || (itemType === 'Osso' && !productId)}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeighingForm;
