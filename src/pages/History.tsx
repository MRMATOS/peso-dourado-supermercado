
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { getWeighings } from '@/services/database';
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

  // Group weighings by type
  const groupedByType: Record<string, { totalWeight: number; totalPrice: number }> = {};

  // Calculate buyers ranking
  const buyersRanking: Record<string, { name: string; totalPrice: number }> = {};

  // Process data for summaries
  weighings.forEach((weighing) => {
    // For buyer ranking - Add null check before accessing buyer properties
    if (weighing.buyer && weighing.buyer_id) {
      if (!buyersRanking[weighing.buyer_id]) {
        buyersRanking[weighing.buyer_id] = {
          name: weighing.buyer.name,
          totalPrice: 0,
        };
      }
      buyersRanking[weighing.buyer_id].totalPrice += weighing.total_price;
    }
  });

  // Sort buyers by total price
  const buyersRankingSorted = Object.values(buyersRanking)
    .sort((a, b) => b.totalPrice - a.totalPrice)
    .slice(0, 5); // Top 5

  // Calculate grand totals
  const totalWeighings = weighings.length;
  const totalWeight = weighings.reduce((sum, w) => sum + w.total_kg, 0);
  const totalPrice = weighings.reduce((sum, w) => sum + w.total_price, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-superdall-blue">Histórico de Pesagens</h1>
          <p className="text-muted-foreground">SuperDallPozo</p>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-superdall-light p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Total de Pesagens</p>
                    <p className="text-2xl font-bold">{totalWeighings}</p>
                  </div>
                  <div className="bg-superdall-light p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Peso Total</p>
                    <p className="text-2xl font-bold">{formatNumber(totalWeight)} kg</p>
                  </div>
                  <div className="bg-superdall-light p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </div>

                {buyersRankingSorted.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Ranking de Compradores</h3>
                    <div className="space-y-2">
                      {buyersRankingSorted.map((buyer, idx) => (
                        <div
                          key={buyer.name}
                          className="flex justify-between items-center p-2 bg-muted rounded"
                        >
                          <div className="flex items-center">
                            <span className="font-medium mr-2">#{idx + 1}</span>
                            <span>{buyer.name}</span>
                          </div>
                          <span className="font-medium text-green-600">
                            {formatCurrency(buyer.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Comprador</th>
                    <th className="p-2 text-right">Peso Total (kg)</th>
                    <th className="p-2 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {weighings.map((weighing) => (
                    <tr key={weighing.id} className="border-b">
                      <td className="p-2">
                        {formatDate(weighing.created_at)}
                      </td>
                      <td className="p-2">
                        {weighing.buyer ? (
                          <>
                            {weighing.buyer.name}
                            {weighing.buyer.company && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({weighing.buyer.company})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Comprador não disponível</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {formatNumber(weighing.total_kg)}
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(weighing.total_price)}
                      </td>
                    </tr>
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
