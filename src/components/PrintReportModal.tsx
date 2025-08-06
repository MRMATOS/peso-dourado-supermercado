
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
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
import WeighingReport from '@/components/WeighingReport';

interface PrintReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrintReportModal = ({ open, onOpenChange }: PrintReportModalProps) => {
  const { buyers, currentEntries, saveWeighing } = useWeighing();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handlePrintAction = useReactToPrint({
    documentTitle: 'Relatório de Pesagem',
    onAfterPrint: () => onOpenChange(false),
    contentRef: reportRef,
  });

  const handlePrint = async () => {
    // Sempre salva no histórico se há entradas e comprador selecionado
    if (selectedBuyerId && currentEntries.length > 0) {
      try {
        await saveWeighing(selectedBuyerId);
      } catch (error) {
        console.error('Erro ao salvar pesagem:', error);
        // Continua com a impressão mesmo se houver erro no salvamento
      }
    }
    handlePrintAction();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px] rounded-lg shadow-lg p-0">
        <DialogHeader className="p-5">
          <DialogTitle className="text-xl font-semibold text-gray-900">Imprimir Relatório</DialogTitle>
          <DialogDescription className="text-gray-600">
            Configure as opções de impressão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-5 pt-0">
          <div className="space-y-2">
            <Label htmlFor="buyer">Comprador</Label>
            <Select
              value={selectedBuyerId}
              onValueChange={setSelectedBuyerId}
            >
              <SelectTrigger id="buyer" className="rounded-lg h-9">
                <SelectValue placeholder="Selecione o comprador" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Hidden report component for printing */}
        <div className="hidden">
          <div ref={reportRef}>
            <WeighingReport
              entries={currentEntries}
              buyerId={selectedBuyerId || undefined}
            />
          </div>
        </div>

        <DialogFooter className="p-5 pt-2 border-t border-gray-100 flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white" size="sm">
            Cancelar
          </Button>
          <Button 
            onClick={handlePrint}
            disabled={currentEntries.length === 0}
            size="sm"
          >
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintReportModal;
