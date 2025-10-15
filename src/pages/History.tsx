import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WeighingProvider } from '@/contexts/WeighingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { getWeighings, getWeighingDetails } from '@/services/database';
import { WeighingEntry } from '@/types/database';
import { Home, ChevronLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WeighingWithBuyer {
  id: string;
  buyer_id: string;
  total_kg: number;
  total_price: number;
  created_at: string;
  tab_name: string;
  report_date: string;
  buyer: {
    id: string;
    name: string;
    company?: string;
  } | null;
}

type FilterPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

const HistoryPage = () => {
  const [weighings, setWeighings] = useState<WeighingWithBuyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week');
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .substring(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [expandedWeighingId, setExpandedWeighingId] = useState<string | null>(null);
  const [weighingDetails, setWeighingDetails] = useState<Record<string, WeighingEntry[]>>({});

  // Load weighings based on the selected period
  const loadWeighings = async () => {
    setIsLoading(true);

    try {
      let options: { startDate?: Date; endDate?: Date } = {};

      // Calculate date range based on filter period
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of the day

      switch (filterPeriod) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of the day
          options = { startDate: today, endDate: now };
          break;

        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0); // Start of yesterday
          const endOfYesterday = new Date(yesterday);
          endOfYesterday.setHours(23, 59, 59, 999); // End of yesterday
          options = { startDate: yesterday, endDate: endOfYesterday };
          break;

        case 'week':
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          lastWeek.setHours(0, 0, 0, 0); // Start of the day 7 days ago
          options = { startDate: lastWeek, endDate: now };
          break;

        case 'month':
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          lastMonth.setHours(0, 0, 0, 0); // Start of the day 1 month ago
          options = { startDate: lastMonth, endDate: now };
          break;

        case 'custom':
          if (startDate) {
            options.startDate = new Date(startDate);
            options.startDate.setHours(0, 0, 0, 0); // Start of the start date
          }
          if (endDate) {
            options.endDate = new Date(endDate);
            options.endDate.setHours(23, 59, 59, 999); // End of the end date
          }
          break;
      }

      const data = await getWeighings(options);
      setWeighings(data as WeighingWithBuyer[]);
    } catch (error) {
      console.error('Error loading weighings:', error);
      toast.error('Erro ao carregar o histórico de pesagens');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeighings();
  }, [filterPeriod]);

  // Load weighing details when expanding
  const handleToggleExpand = async (weighingId: string) => {
    if (expandedWeighingId === weighingId) {
      setExpandedWeighingId(null);
      return;
    }

    setExpandedWeighingId(weighingId);

    // Load details if not already loaded
    if (!weighingDetails[weighingId]) {
      try {
        const details = await getWeighingDetails(weighingId) as WeighingEntry[];
        setWeighingDetails(prev => ({
          ...prev,
          [weighingId]: details
        }));
      } catch (error) {
        console.error('Error loading weighing details:', error);
        toast.error('Erro ao carregar detalhes da pesagem');
      }
    }
  };

  // Calculate grand totals
  const totalWeighings = weighings.length;
  const totalWeight = weighings.reduce((sum, w) => sum + w.total_kg, 0);
  const totalPrice = weighings.reduce((sum, w) => sum + w.total_price, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#3A86F7" }}>Histórico de Pesagens</h1>
          <p className="text-muted-foreground">Super Dal Pozzo</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Início
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Filter Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filtrar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filterPeriod">Período</Label>
              <Select
                value={filterPeriod}
                onValueChange={(value) => setFilterPeriod(value as FilterPeriod)}
              >
                <SelectTrigger id="filterPeriod">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterPeriod === 'custom' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={loadWeighings}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Filtrar'}
                </Button>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={loadWeighings}
                className="w-full flex items-center justify-center"
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : weighings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma pesagem encontrada no período selecionado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Total de Pesagens</p>
                  <p className="text-2xl font-bold">{totalWeighings}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Peso Total</p>
                  <p className="text-2xl font-bold">{formatNumber(totalWeight, 2)} kg</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weighings List */}
      <Card>
        <CardHeader>
          <CardTitle>Listagem de Pesagens</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : weighings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma pesagem encontrada no período selecionado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left w-8"></th>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-right">Peso Total (kg)</th>
                    <th className="p-2 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {weighings.map((weighing) => (
                    <React.Fragment key={weighing.id}>
                      <tr 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleExpand(weighing.id)}
                      >
                        <td className="p-2 text-center">
                          {expandedWeighingId === weighing.id ? (
                            <ChevronUp className="h-4 w-4 inline" />
                          ) : (
                            <ChevronDown className="h-4 w-4 inline" />
                          )}
                        </td>
                        <td className="p-2">
                          {formatDate(weighing.created_at)}
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(weighing.total_kg)}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(weighing.total_price)}
                        </td>
                      </tr>
                      {expandedWeighingId === weighing.id && weighingDetails[weighing.id] && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <div className="bg-gray-50 p-4 border-t">
                              <h4 className="font-semibold mb-3 text-sm text-gray-700">Detalhes da Pesagem</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-gray-200">
                                      <th className="p-2 text-left border">Tipo</th>
                                      <th className="p-2 text-right border">Peso Bruto</th>
                                      <th className="p-2 text-right border">Tara</th>
                                      <th className="p-2 text-right border">Peso Líquido</th>
                                      <th className="p-2 text-right border">Preço Unit.</th>
                                      <th className="p-2 text-right border">Valor Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {weighingDetails[weighing.id].map((entry) => (
                                      <tr key={entry.id} className="border-b">
                                        <td className="p-2 border">{entry.item_type}</td>
                                        <td className="p-2 text-right border">{formatNumber(entry.gross_weight, 2)} kg</td>
                                        <td className="p-2 text-right border">{formatNumber(entry.tare_used, 2)} kg</td>
                                        <td className="p-2 text-right border font-semibold">{formatNumber(entry.net_weight, 2)} kg</td>
                                        <td className="p-2 text-right border">{formatCurrency(entry.unit_price)}</td>
                                        <td className="p-2 text-right border font-semibold text-emerald-600">{formatCurrency(entry.total_price)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const HistoryPageWrapper = () => {
  return (
    <WeighingProvider>
      <HistoryPage />
    </WeighingProvider>
  );
};

export default HistoryPageWrapper;
