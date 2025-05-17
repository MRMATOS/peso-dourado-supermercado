
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NewWeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave: () => void;
}

const NewWeighingModal = ({ 
  open, 
  onOpenChange, 
  onDiscard, 
  onSave 
}: NewWeighingModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-lg shadow-lg p-0">
        <DialogHeader className="p-5">
          <DialogTitle className="text-xl font-semibold text-gray-900">Nova Pesagem</DialogTitle>
          <DialogDescription className="text-gray-600">
            Existem itens não salvos. O que deseja fazer?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="p-5 pt-2 flex gap-2 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            size="sm"
          >
            Descartar
          </Button>
          <Button
            onClick={onSave}
            size="sm"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewWeighingModal;
