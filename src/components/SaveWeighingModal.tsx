
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Salvar Pesagem</DialogTitle>
          <DialogDescription>
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="buyer">Comprador</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedBuyerId}
                    onValueChange={setSelectedBuyerId}
                  >
                    <SelectTrigger id="buyer" className="flex-1">
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
                  <Button type="button" onClick={() => setShowNewBuyerForm(true)} variant="outline">
                    Novo
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 mt-4">
                <h4 className="font-medium">Resumo da pesagem</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Itens:</p>
                    <p className="font-medium">{currentEntries.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Peso total:</p>
                    <p className="font-medium">{formatNumber(totalWeight)} kg</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Valor total:</p>
                    <p className="font-bold text-lg text-green-600">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
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
