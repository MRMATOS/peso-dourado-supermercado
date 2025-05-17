
import React from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import { formatCurrency, formatDate, formatNumber, formatPhone, formatDocument } from '@/lib/utils';
import { WeighingEntryForm } from '@/types/database';

interface WeighingReportProps {
  entries: WeighingEntryForm[];
  buyerId?: string;
}

const WeighingReport = ({ entries, buyerId }: WeighingReportProps) => {
  const { buyers, settings } = useWeighing();
  
  // Group entries by item type
  const entriesByType: Record<string, WeighingEntryForm[]> = {};
  entries.forEach(entry => {
    if (!entriesByType[entry.itemType]) {
      entriesByType[entry.itemType] = [];
    }
    entriesByType[entry.itemType].push(entry);
  });
  
  // For Osso type, group by product
  const ossoEntriesByProduct: Record<string, WeighingEntryForm[]> = {};
  const ossoEntries = entriesByType['Osso'] || [];
  ossoEntries.forEach(entry => {
    const productKey = entry.productDescription || 'Sem Produto';
    if (!ossoEntriesByProduct[productKey]) {
      ossoEntriesByProduct[productKey] = [];
    }
    ossoEntriesByProduct[productKey].push(entry);
  });
  
  // Get selected buyer
  const selectedBuyer = buyerId ? buyers.find(b => b.id === buyerId) : null;
  
  // Calculate totals
  const totalNetWeight = entries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
  const totalPrice = entries.reduce((sum, entry) => sum + entry.totalPrice, 0);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Relatório de Pesagem - Super Dal Pozzo
        </h1>
        <p className="text-sm text-gray-600">
          Data de emissão: {formatDate(new Date())}
        </p>
        {selectedBuyer && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-left">
            <h3 className="text-lg font-medium mb-2">Dados do Comprador:</h3>
            <p className="mb-1"><strong>Nome:</strong> {selectedBuyer.name}</p>
            {selectedBuyer.phone && <p className="mb-1"><strong>Telefone:</strong> {formatPhone(selectedBuyer.phone)}</p>}
            {selectedBuyer.document && <p className="mb-1"><strong>Documento:</strong> {formatDocument(selectedBuyer.document)}</p>}
            {selectedBuyer.company && <p className="mb-1"><strong>Empresa:</strong> {selectedBuyer.company}</p>}
          </div>
        )}
      </div>

      {/* Content - Only Totals */}
      <div className="space-y-6">
        {/* Group by item type */}
        {Object.entries(entriesByType)
          .filter(([type]) => type !== 'Osso') // Handle Osso separately
          .map(([type, typeEntries]) => {
            const typeTotalWeight = typeEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
            const typeTotalPrice = typeEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
            
            return (
              <div key={type} className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  Resumo de {type}
                </h2>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Quantidade de itens:</p>
                      <p className="text-lg font-semibold">{typeEntries.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Peso total:</p>
                      <p className="text-lg font-semibold">{formatNumber(typeTotalWeight, 2)} kg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Valor total:</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(typeTotalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        
        {/* Osso - Group by product */}
        {ossoEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Resumo de Osso
            </h2>
            
            {Object.entries(ossoEntriesByProduct).map(([product, productEntries]) => {
              const productTotalWeight = productEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
              const productTotalPrice = productEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
              
              return (
                <div key={product} className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    Produto: {product}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Quantidade de itens:</p>
                      <p className="text-lg font-semibold">{productEntries.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Peso total:</p>
                      <p className="text-lg font-semibold">{formatNumber(productTotalWeight, 2)} kg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Valor total:</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(productTotalPrice)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Osso grand total */}
            <div className="mt-4 p-4 bg-gray-100 font-medium rounded">
              <p className="text-gray-800">Total Osso: {formatNumber(ossoEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0), 2)} kg</p>
              <p className="text-gray-800">Valor Total Osso: {formatCurrency(ossoEntries.reduce((sum, entry) => sum + entry.totalPrice, 0))}</p>
            </div>
          </div>
        )}
        
        {/* Grand Total */}
        <div className="border-t pt-4 mt-8">
          <div className="flex justify-between font-medium text-lg">
            <span className="text-gray-700">Peso Líquido Total:</span>
            <span className="text-gray-900">{formatNumber(totalNetWeight, 2)} kg</span>
          </div>
          <div className="flex justify-between font-semibold text-xl mt-2">
            <span className="text-gray-700">Valor Total:</span>
            <span className="text-emerald-600">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t text-center text-sm text-gray-600">
        {settings?.report_footer1 && <p>{settings.report_footer1}</p>}
        {settings?.report_footer2 && <p>{settings.report_footer2}</p>}
      </div>
    </div>
  );
};

export default WeighingReport;
