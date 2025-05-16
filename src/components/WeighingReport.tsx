
import React from 'react';
import { useWeighing } from '@/contexts/WeighingContext';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
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
          Relatório de Pesagem - SuperDallPozo
        </h1>
        <p className="text-sm text-gray-600">
          Data de emissão: {formatDate(new Date())}
        </p>
        {selectedBuyer && (
          <p className="mt-2 font-medium text-gray-800">
            Comprador: {selectedBuyer.name}
            {selectedBuyer.company && ` - ${selectedBuyer.company}`}
          </p>
        )}
      </div>

      {/* Content */}
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
                  Relatório de pesagem: {type}
                </h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 rounded-t-lg">
                      <th className="border border-gray-200 p-2 text-left text-gray-700">Peso Bruto (kg)</th>
                      <th className="border border-gray-200 p-2 text-left text-gray-700">Tara (kg)</th>
                      <th className="border border-gray-200 p-2 text-left text-gray-700">Peso Líquido (kg)</th>
                      <th className="border border-gray-200 p-2 text-left text-gray-700">Preço/kg</th>
                      <th className="border border-gray-200 p-2 text-left text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeEntries.map((entry, idx) => (
                      <tr key={entry.id} className={(idx % 2 === 0) ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(entry.grossWeightKg)}</td>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(entry.tareKg)}</td>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(entry.netWeightKg)}</td>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatCurrency(entry.unitPrice)}</td>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatCurrency(entry.totalPrice)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium bg-gray-100">
                      <td className="border border-gray-200 p-2 text-gray-700" colSpan={2}>
                        Total de itens: {typeEntries.length}
                      </td>
                      <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(typeTotalWeight)}</td>
                      <td className="border border-gray-200 p-2"></td>
                      <td className="border border-gray-200 p-2 text-gray-800">{formatCurrency(typeTotalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        
        {/* Osso - Group by product */}
        {ossoEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Relatório de pesagem: Osso
            </h2>
            
            {Object.entries(ossoEntriesByProduct).map(([product, productEntries]) => {
              const productTotalWeight = productEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0);
              const productTotalPrice = productEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);
              
              return (
                <div key={product} className="mb-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    Produto: {product}
                  </h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left text-gray-700">Peso Bruto (kg)</th>
                        <th className="border border-gray-200 p-2 text-left text-gray-700">Tara (kg)</th>
                        <th className="border border-gray-200 p-2 text-left text-gray-700">Peso Líquido (kg)</th>
                        <th className="border border-gray-200 p-2 text-left text-gray-700">Preço/kg</th>
                        <th className="border border-gray-200 p-2 text-left text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productEntries.map((entry, idx) => (
                        <tr key={entry.id} className={(idx % 2 === 0) ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(entry.grossWeightKg)}</td>
                          <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(entry.tareKg)}</td>
                          <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(entry.netWeightKg)}</td>
                          <td className="border border-gray-200 p-2 text-gray-800">{formatCurrency(entry.unitPrice)}</td>
                          <td className="border border-gray-200 p-2 text-gray-800">{formatCurrency(entry.totalPrice)}</td>
                        </tr>
                      ))}
                      <tr className="font-medium bg-gray-100">
                        <td className="border border-gray-200 p-2 text-gray-700" colSpan={2}>
                          Total de itens: {productEntries.length}
                        </td>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatNumber(productTotalWeight)}</td>
                        <td className="border border-gray-200 p-2"></td>
                        <td className="border border-gray-200 p-2 text-gray-800">{formatCurrency(productTotalPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
            
            {/* Osso grand total */}
            <div className="mt-4 p-3 bg-gray-100 font-medium rounded">
              <p className="text-gray-800">Total Osso: {formatNumber(ossoEntries.reduce((sum, entry) => sum + entry.netWeightKg, 0))} kg</p>
              <p className="text-gray-800">Valor Total Osso: {formatCurrency(ossoEntries.reduce((sum, entry) => sum + entry.totalPrice, 0))}</p>
            </div>
          </div>
        )}
        
        {/* Grand Total */}
        <div className="border-t pt-4 mt-8">
          <div className="flex justify-between font-medium text-lg">
            <span className="text-gray-700">Peso Líquido Total:</span>
            <span className="text-gray-900">{formatNumber(totalNetWeight)} kg</span>
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
