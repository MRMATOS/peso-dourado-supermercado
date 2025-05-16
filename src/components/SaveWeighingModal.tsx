
import React, { useState } from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import NewBuyerForm from '@/components/NewBuyerForm';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface SaveWeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SaveWeighingModal = ({ open, onOpenChange }: SaveWeighingModalProps) => {
  const { 
    buyers, 
    currentEntries, 
    saveWeighing, 
    isSaving 
  } = useWeighing();

  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [showNewBuyerForm, setShowNewBuyerForm] = useState(false);

  // Calculate summary data
  const totalWeight = currentEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
  const totalPrice = currentEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);

  const handleSave = async () => {
    if (!selectedBuyerId) {
      alert('Selecione um comprador');
      return;
    }

    const success = await saveWeighing(selectedBuyerId);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-lg shadow-lg p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-gray-900">Salvar Pesagem</DialogTitle>
          <DialogDescription className="text-gray-600">
            Selecione o comprador para salvar esta pesagem.
          </DialogDescription>
        </DialogHeader>

        {showNewBuyerForm ? (
          <NewBuyerForm 
            onBuyerCreated={(newBuyer) => {
              setSelectedBuyerId(newBuyer.id.toString());
              setShowNewBuyerForm(false);
            }}
            onCancel={() => setShowNewBuyerForm(false)}
          />
        ) : (
          <>
            <div className="space-y-4 p-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="buyer">Comprador</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedBuyerId}
                    onValueChange={setSelectedBuyerId}
                  >
                    <SelectTrigger id="buyer" className="flex-1 rounded-lg h-9">
                      <SelectValue placeholder="Selecione o comprador" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id.toString()}>
                          {buyer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={() => setShowNewBuyerForm(true)} variant="outline" size="default" className="bg-white h-9">
                    Novo
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3 mt-4">
                <h4 className="font-medium text-gray-900">Resumo da pesagem</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Itens:</p>
                    <p className="font-medium text-gray-900">{currentEntries.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Peso total:</p>
                    <p className="font-medium text-gray-900">{formatNumber(totalWeight)} kg</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Valor total:</p>
                    <p className="font-bold text-lg text-emerald-600">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-2 border-t border-gray-100 flex flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!selectedBuyerId || isSaving}
              >
                {isSaving ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaveWeighingModal;
