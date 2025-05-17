
import React, { useState } from 'react';
import { WeighingProvider } from '@/contexts/WeighingContext';
import { useWeighing } from '@/contexts/WeighingContext';
import WeighingForm from '@/components/WeighingForm';
import EntriesList from '@/components/EntriesList';
import SaveWeighingModal from '@/components/SaveWeighingModal';
import PrintReportModal from '@/components/PrintReportModal';
import NewWeighingModal from '@/components/NewWeighingModal';
import { Button } from '@/components/ui/button';
import { Printer, Save, Plus, History, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const WeighingPage = () => {
  const { currentEntries, clearEntries } = useWeighing();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [newWeighingModalOpen, setNewWeighingModalOpen] = useState(false);

  const handleNewWeighing = () => {
    if (currentEntries.length > 0) {
      setNewWeighingModalOpen(true);
    } else {
      clearEntries();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#3A86F7" }}>Sistema de Pesagem</h1>
          <p className="text-sm text-gray-600">Super Dal Pozzo</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/history">
              <History className="mr-2 h-4 w-4" />
              Histórico
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/config">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <WeighingForm />
        <EntriesList />
      </main>

      <SaveWeighingModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
      />

      <PrintReportModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
      />

      <NewWeighingModal
        open={newWeighingModalOpen}
        onOpenChange={setNewWeighingModalOpen}
        onDiscard={() => {
          clearEntries();
        }}
        onSave={() => {
          setSaveModalOpen(true);
        }}
      />
    </div>
  );
};

const IndexPage = () => {
  return (
    <WeighingProvider>
      <WeighingPage />
    </WeighingProvider>
  );
};

export default IndexPage;
