import React from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowDownAZ, ArrowUpAZ, Trash2, ClipboardList, Printer, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EntriesListProps {
  onPrint?: () => void;
  onNew?: () => void;
}

const EntriesList = ({
  onPrint,
  onNew
}: EntriesListProps) => {
  const {
    currentEntries,
    removeEntry,
    sortOrder,
    toggleSortOrder
  } = useWeighing();

  // Calculate totals
  const totalNetWeight = currentEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
  const totalAmount = currentEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);

  const ActionButtons = () => (
    <div className="flex flex-wrap gap-2 justify-end mb-4">
      <Button variant="outline" onClick={onNew} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Nova Pesagem
      </Button>

      <Button variant="outline" onClick={onPrint} disabled={currentEntries.length === 0} size="sm" className="bg-[#3986f7] text-slate-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
    </div>
  );

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
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-600">Peso Total</p>
            <p className="text-sm text-gray-500">Itens: {currentEntries.length}</p>
          </div>
          <p className="text-2xl font-bold">{formatNumber(totalNetWeight, 2)} kg</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-sm text-gray-500">Média: {formatCurrency(totalAmount / currentEntries.length)}/item</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* Action buttons above the list */}
      {currentEntries.length > 0 && <ActionButtons />}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium" style={{ color: "#3A86F7" }}>Itens Registrados</h3>
        <Button variant="outline" size="sm" onClick={toggleSortOrder} className="text-gray-700">
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

      <Card className="mb-6 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TIPO</TableHead>
                <TableHead>PRODUTO</TableHead>
                <TableHead className="text-right">PESO BRUTO</TableHead>
                <TableHead className="text-right">TARA</TableHead>
                <TableHead className="text-right">PESO LÍQUIDO</TableHead>
                <TableHead className="text-right">PREÇO UNIT.</TableHead>
                <TableHead className="text-right">VALOR TOTAL</TableHead>
                <TableHead className="text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEntries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.itemType}</TableCell>
                  <TableCell>{entry.productDescription || "-"}</TableCell>
                  <TableCell className="text-right">{formatNumber(entry.grossWeightKg, 2)} kg</TableCell>
                  <TableCell className="text-right">{formatNumber(entry.tareKg, 2)} kg</TableCell>
                  <TableCell className="text-right">{formatNumber(entry.netWeightKg, 2)} kg</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.unitPrice)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(entry.totalPrice)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Action buttons below the list */}
      {currentEntries.length > 0 && <ActionButtons />}
    </div>
  );
};

export default EntriesList;