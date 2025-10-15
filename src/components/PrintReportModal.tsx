
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
import { Button } from '@/components/ui/button';
import WeighingReport from '@/components/WeighingReport';

interface PrintReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrintReportModal = ({ open, onOpenChange }: PrintReportModalProps) => {
  const { currentEntries, saveWeighing, settings } = useWeighing();
  
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handlePrintAction = useReactToPrint({
    documentTitle: 'Relatório de Pesagem',
    onAfterPrint: () => onOpenChange(false),
    contentRef: reportRef,
  });

  const handlePrint = async () => {
    // Sempre salva no histórico se há entradas
    if (currentEntries.length > 0) {
      try {
        await saveWeighing(null);
      } catch (error) {
        console.error('Erro ao salvar pesagem:', error);
        // Continua com a impressão mesmo se houver erro no salvamento
      }
    }
    handlePrintAction();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg p-0">
        <DialogHeader className="p-5">
          <DialogTitle className="text-xl font-semibold text-gray-900">Imprimir Relatório</DialogTitle>
          <DialogDescription className="text-gray-600">
            Clique em imprimir para salvar e gerar o relatório.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden report component for printing */}
        <div className="hidden">
          <div ref={reportRef}>
            <WeighingReport
              entries={currentEntries}
              isDetailed={settings?.detailed_report || false}
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
