
import React from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Trash2, 
  ClipboardList 
} from 'lucide-react';

const EntriesList = () => {
  const { 
    currentEntries, 
    removeEntry, 
    sortOrder, 
    toggleSortOrder 
  } = useWeighing();

  if (currentEntries.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Nenhum item adicionado</h3>
            <p className="text-sm text-muted-foreground">
              Adicione itens ao formulário acima para visualizá-los aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalNetWeight = currentEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
  const totalAmount = currentEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Itens Adicionados</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSortOrder}
          className="flex items-center gap-1"
        >
          {sortOrder === 'newest' ? (
            <>
              <ArrowDownAZ className="h-4 w-4" />
              <span className="hidden sm:inline">Mais recentes primeiro</span>
            </>
          ) : (
            <>
              <ArrowUpAZ className="h-4 w-4" />
              <span className="hidden sm:inline">Mais antigos primeiro</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {currentEntries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tipo: {entry.itemType}</p>
                  {entry.productDescription && (
                    <p className="text-sm">Produto: {entry.productDescription}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Peso Bruto:</p>
                    <p>{formatNumber(entry.grossWeightKg)} kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Tara:</p>
                    <p>{formatNumber(entry.tareKg)} kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Peso Líquido:</p>
                    <p>{formatNumber(entry.netWeightKg)} kg</p>
                  </div>
                  <div>
                    <p className="font-medium">Preço por kg:</p>
                    <p>{formatCurrency(entry.unitPrice)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total:</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(entry.totalPrice)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted p-4 rounded-lg mt-4">
        <div>
          <p className="text-sm font-medium">Total de Itens: {currentEntries.length}</p>
          <p className="text-sm font-medium">Peso Líquido Total: {formatNumber(totalNetWeight)} kg</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <p className="text-lg font-bold">Valor Total:</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
};

export default EntriesList;
