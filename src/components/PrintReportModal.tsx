
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
import { Checkbox } from '@/components/ui/checkbox';
import WeighingReport from '@/components/WeighingReport';

interface PrintReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrintReportModal = ({ open, onOpenChange }: PrintReportModalProps) => {
  const { buyers, currentEntries } = useWeighing();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [printOnlyCurrentData, setPrintOnlyCurrentData] = useState(true);
  
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    documentTitle: 'Relatório de Pesagem',
    onAfterPrint: () => onOpenChange(false),
    contentRef: reportRef,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Imprimir Relatório</DialogTitle>
          <DialogDescription>
            Configure as opções de impressão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="buyer">Comprador</Label>
            <Select
              value={selectedBuyerId}
              onValueChange={setSelectedBuyerId}
            >
              <SelectTrigger id="buyer">
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="currentData"
              checked={printOnlyCurrentData}
              onCheckedChange={(checked) => 
                setPrintOnlyCurrentData(checked as boolean)
              }
            />
            <Label htmlFor="currentData">
              Imprimir apenas dados atuais (não salvas)
            </Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePrint}
            disabled={currentEntries.length === 0}
          >
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintReportModal;
