
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

  // Calculate totals
  const totalNetWeight = currentEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
  const totalAmount = currentEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);

  if (currentEntries.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center py-8">
            <ClipboardList className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-700">Nenhum item adicionado</h3>
            <p className="text-sm text-gray-500">
              Adicione itens ao formulário acima para visualizá-los aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600 mb-1">Peso Total</p>
          <p className="text-2xl font-bold">{formatNumber(totalNetWeight)} kg</p>
          <p className="text-sm text-gray-500 mt-1">Itens: {currentEntries.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600 mb-1">Valor Total</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAmount)}</p>
          <p className="text-sm text-gray-500 mt-1">Média: {formatCurrency(totalAmount / currentEntries.length)}/item</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">Itens Adicionados</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSortOrder}
          className="text-gray-700"
        >
          {sortOrder === 'newest' ? (
            <>
              <ArrowDownAZ className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Mais recentes primeiro</span>
            </>
          ) : (
            <>
              <ArrowUpAZ className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Mais antigos primeiro</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {currentEntries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden rounded-lg shadow-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">Tipo: {entry.itemType}</p>
                  {entry.productDescription && (
                    <p className="text-sm text-gray-700">Produto: {entry.productDescription}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Peso Bruto:</p>
                    <p className="text-gray-900">{formatNumber(entry.grossWeightKg)} kg</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Tara:</p>
                    <p className="text-gray-900">{formatNumber(entry.tareKg)} kg</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Peso Líquido:</p>
                    <p className="text-gray-900">{formatNumber(entry.netWeightKg)} kg</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Preço por kg:</p>
                    <p className="text-gray-900">{formatCurrency(entry.unitPrice)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total:</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      {formatCurrency(entry.totalPrice)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EntriesList;
