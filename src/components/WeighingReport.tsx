
import React from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import { formatCurrency, formatDate, formatNumber, formatPhone, formatDocument } from '@/lib/utils';
import { WeighingEntryForm } from '@/types/database';

interface WeighingReportProps {
  entries: WeighingEntryForm[];
  buyerId?: string;
}

const WeighingReport = ({ entries, buyerId }: WeighingReportProps) => {
  const { buyers, settings, tarifsById } = useWeighing();
  
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
    <div className="p-4 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-4 border-b pb-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Relatório de Pesagem - Super Dal Pozzo
        </h1>
        <p className="text-xs text-gray-600">
          Data de emissão: {formatDate(new Date())}
        </p>
        {selectedBuyer && (
          <div className="mt-2 p-3 border rounded-lg bg-gray-50 text-left">
            <h3 className="text-sm font-medium mb-1">Dados do Comprador:</h3>
            <p className="text-xs mb-0.5"><strong>Nome:</strong> {selectedBuyer.name}</p>
            {selectedBuyer.phone && <p className="text-xs mb-0.5"><strong>Telefone:</strong> {formatPhone(selectedBuyer.phone)}</p>}
            {selectedBuyer.document && <p className="text-xs mb-0.5"><strong>Documento:</strong> {formatDocument(selectedBuyer.document)}</p>}
            {selectedBuyer.company && <p className="text-xs mb-0.5"><strong>Empresa:</strong> {selectedBuyer.company}</p>}
          </div>
        )}
      </div>

      {/* Content - Only Totals */}
      <div className="space-y-3">
        {/* Group by item type */}
        {Object.entries(entriesByType)
          .filter(([type]) => type !== 'Osso') // Handle Osso separately
          .map(([type, typeEntries]) => {
            const typeTotalWeight = typeEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
            const typeTotalPrice = typeEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
            // Get tara value from the most recent entry
            const tareValue = typeEntries[0]?.tareKg || tarifsById[type] || 0;
            
            return (
              <div key={type} className="mb-3">
                <h2 className="text-base font-semibold mb-1.5 text-[#3A86F7]">
                  Resumo de {type}
                </h2>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Quantidade de itens:</p>
                      <p className="font-semibold">{typeEntries.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Peso total:</p>
                      <p className="font-semibold">{formatNumber(typeTotalWeight, 2)} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Tara utilizada:</p>
                      <p className="font-semibold">{formatNumber(tareValue, 2)} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Valor total:</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(typeTotalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        
        {/* Osso - Group by product */}
        {ossoEntries.length > 0 && (
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-1.5 text-[#3A86F7]">
              Resumo de Osso
            </h2>
            
            {Object.entries(ossoEntriesByProduct).map(([product, productEntries]) => {
              const productTotalWeight = productEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
              const productTotalPrice = productEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
              // Get tara value from the most recent entry
              const tareValue = productEntries[0]?.tareKg || tarifsById['Osso'] || 0;
              
              return (
                <div key={product} className="mb-2 p-3 border rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium mb-1.5 text-gray-800">
                    Produto: {product}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Quantidade de itens:</p>
                      <p className="font-semibold">{productEntries.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Peso total:</p>
                      <p className="font-semibold">{formatNumber(productTotalWeight, 2)} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Tara utilizada:</p>
                      <p className="font-semibold">{formatNumber(tareValue, 2)} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Valor total:</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(productTotalPrice)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Grand Total */}
        <div className="border-t pt-3 mt-4">
          <div className="flex justify-between font-medium">
            <span className="text-gray-700">Peso Líquido Total:</span>
            <span className="text-gray-900">{formatNumber(totalNetWeight, 2)} kg</span>
          </div>
          <div className="flex justify-between font-semibold text-base mt-1">
            <span className="text-gray-700">Valor Total:</span>
            <span className="text-emerald-600">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t text-center text-xs text-gray-600">
        {settings?.report_footer1 && <p>{settings.report_footer1}</p>}
        {settings?.report_footer2 && <p>{settings.report_footer2}</p>}
      </div>
    </div>
  );
};

export default WeighingReport;
