import React, { useState, useEffect, FormEvent } from 'react';
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

  // Filter products by selected item type
  const filteredProducts = products.filter(product => product.item_type === itemType);
  
  // Reset form
  const resetForm = () => {
    setItemType('');
    setProductId(null);
    setGrossWeightKg(0);
    setTareKg(0);
    setNetWeightKg(0);
    setUnitPrice(0);
    setTotalPrice(0);
  };

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
    
    // Reset form
    setItemType('');
    setProductId(null);
    setGrossWeightKg(0);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Pesagem */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Tipo de Pesagem</Label>
              <Select
                value={itemType}
                onValueChange={setItemType}
              >
                <SelectTrigger id="itemType">
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
                {itemType !== 'Osso' && <span className="text-xs text-muted-foreground ml-1">(Apenas para Osso)</span>}
              </Label>
              <Select
                value={productId || ''}
                onValueChange={(value) => setProductId(value || null)}
                disabled={itemType !== 'Osso'}
              >
                <SelectTrigger id="productId">
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
                decimalPlaces={3}
                placeholder="0,000"
                className="input-weight"
                suffix="kg"
                clearOnFocus
              />
            </div>

            {/* Tara */}
            <div className="space-y-2">
              <Label htmlFor="tare">Tara (kg)</Label>
              <NumberInput
                id="tare"
                value={tareKg}
                onChange={setTareKg}
                decimalPlaces={3}
                placeholder="0,000"
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
                decimalPlaces={3}
                suffix="kg"
                disabled
                className="bg-muted"
              />
            </div>

            {/* Preço Unitário */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Preço por kg</Label>
              <NumberInput
                id="unitPrice"
                value={unitPrice}
                onChange={() => {}} // Read-only
                decimalPlaces={2}
                prefix="R$"
                disabled
                className="bg-muted"
              />
            </div>

            {/* Preço Total (calculated) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="totalPrice">Preço Total</Label>
              <div className="flex items-center">
                <NumberInput
                  id="totalPrice"
                  value={totalPrice}
                  onChange={() => {}} // Read-only
                  decimalPlaces={2}
                  prefix="R$"
                  disabled
                  className="bg-muted font-bold text-green-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={!itemType || grossWeightKg <= 0 || (itemType === 'Osso' && !productId)}
            >
              Adicionar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeighingForm;
