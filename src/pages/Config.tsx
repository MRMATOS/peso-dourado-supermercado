import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WeighingProvider } from '@/contexts/WeighingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import NumberInput from '@/components/NumberInput';
import { createProduct, getProducts, updateProduct, deleteProduct, createUnitPrice, getUnitPrices, updateUnitPrice, deleteUnitPrice, createTareWeight, getTareWeights, updateTareWeight, deleteTareWeight, getBuyers, createBuyer, updateBuyer, deleteBuyer, getSettings, updateSettings } from '@/services/database';
import { formatDocument, validateDocument, formatPhone } from '@/lib/utils';
import { Buyer, Product, TareWeight, UnitPrice, Settings } from '@/types/database';
const ConfigPage = () => {
  const [activeTab, setActiveTab] = useState('types');
  const [isLoading, setIsLoading] = useState(true);

  // Item Types data
  const [unitPrices, setUnitPrices] = useState<UnitPrice[]>([]);
  const [editedUnitPrices, setEditedUnitPrices] = useState<Record<string, number>>({});
  const [newItemType, setNewItemType] = useState('');
  const [newUnitPrice, setNewUnitPrice] = useState(0);

  // Products data
  const [products, setProducts] = useState<Product[]>([]);
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductType, setNewProductType] = useState('');

  // Tare weights data
  const [tareWeights, setTareWeights] = useState<TareWeight[]>([]);
  const [editedTareWeights, setEditedTareWeights] = useState<Record<string, number>>({});
  const [newTareType, setNewTareType] = useState('');
  const [newTareWeight, setNewTareWeight] = useState(0);

  // Buyers data
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [editedBuyers, setEditedBuyers] = useState<Record<string, Partial<Buyer>>>({});
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newBuyerDocument, setNewBuyerDocument] = useState('');
  const [newBuyerCompany, setNewBuyerCompany] = useState('');

  // Report Settings
  const [settings, setSettings] = useState<Settings | null>(null);
  const [reportFooter1, setReportFooter1] = useState('');
  const [reportFooter2, setReportFooter2] = useState('');

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        switch (activeTab) {
          case 'types':
            const unitPricesData = await getUnitPrices();
            setUnitPrices(unitPricesData as UnitPrice[]);
            setEditedUnitPrices({});
            break;
          case 'products':
            const productsData = await getProducts();
            setProducts(productsData as Product[]);
            setEditedProducts({});
            const unitPricesForDropdown = await getUnitPrices();
            setUnitPrices(unitPricesForDropdown as UnitPrice[]);
            break;
          case 'tare':
            const tareWeightsData = await getTareWeights();
            setTareWeights(tareWeightsData as TareWeight[]);
            setEditedTareWeights({});
            const unitPricesForTare = await getUnitPrices();
            setUnitPrices(unitPricesForTare as UnitPrice[]);
            break;
          case 'buyers':
            const buyersData = await getBuyers();
            setBuyers(buyersData as Buyer[]);
            setEditedBuyers({});
            break;
          case 'report':
            const settingsData = await getSettings();
            setSettings(settingsData as Settings | null);
            setReportFooter1(settingsData?.report_footer1 || '');
            setReportFooter2(settingsData?.report_footer2 || '');
            break;
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error);
        toast.error(`Erro ao carregar dados de ${activeTab}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  // Item Types handlers
  const handleAddItemType = async () => {
    if (!newItemType.trim()) {
      toast.error('O tipo de pesagem é obrigatório');
      return;
    }
    if (newUnitPrice <= 0) {
      toast.error('O preço unitário deve ser maior que zero');
      return;
    }
    setIsLoading(true);
    try {
      // Check if type already exists
      const existingType = unitPrices.find(up => up.item_type.toLowerCase() === newItemType.trim().toLowerCase());
      if (existingType) {
        toast.error('Este tipo de pesagem já existe');
        return;
      }
      const newUnitPriceItem = await createUnitPrice({
        item_type: newItemType.trim(),
        price: newUnitPrice
      });
      setUnitPrices([...unitPrices, newUnitPriceItem as UnitPrice]);
      setNewItemType('');
      setNewUnitPrice(0);
      toast.success('Tipo de pesagem adicionado com sucesso');
    } catch (error) {
      console.error('Error adding item type:', error);
      toast.error('Erro ao adicionar tipo de pesagem');
    } finally {
      setIsLoading(false);
    }
  };
  const handleUnitPriceChange = (id: string, price: number) => {
    setEditedUnitPrices({
      ...editedUnitPrices,
      [id]: price
    });
  };
  const handleSaveUnitPrices = async () => {
    setIsLoading(true);
    try {
      const updates = Object.entries(editedUnitPrices);
      if (updates.length === 0) {
        toast.info('Nenhuma alteração para salvar');
        setIsLoading(false);
        return;
      }
      for (const [id, price] of updates) {
        await updateUnitPrice(id, {
          price
        });
      }
      setUnitPrices(unitPrices.map(up => {
        if (editedUnitPrices[up.id] !== undefined) {
          return {
            ...up,
            price: editedUnitPrices[up.id]
          };
        }
        return up;
      }));
      setEditedUnitPrices({});
      toast.success('Preços atualizados com sucesso');
    } catch (error) {
      console.error('Error updating unit prices:', error);
      toast.error('Erro ao atualizar preços');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteItemType = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de pesagem?')) {
      return;
    }
    setIsLoading(true);
    try {
      await deleteUnitPrice(id);
      setUnitPrices(unitPrices.filter(up => up.id !== id));

      // Remove from edited state if present
      const {
        [id]: _,
        ...rest
      } = editedUnitPrices;
      setEditedUnitPrices(rest);
      toast.success('Tipo de pesagem excluído com sucesso');
    } catch (error) {
      console.error('Error deleting item type:', error);
      toast.error('Erro ao excluir tipo de pesagem');
    } finally {
      setIsLoading(false);
    }
  };

  // Products handlers
  const handleAddProduct = async () => {
    if (!newProductCode.trim()) {
      toast.error('O código do produto é obrigatório');
      return;
    }
    if (!newProductDescription.trim()) {
      toast.error('A descrição do produto é obrigatória');
      return;
    }
    if (!newProductType) {
      toast.error('O tipo do produto é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      // Check if product already exists
      const existingProduct = products.find(p => p.code.toLowerCase() === newProductCode.trim().toLowerCase() || p.description.toLowerCase() === newProductDescription.trim().toLowerCase());
      if (existingProduct) {
        toast.error('Já existe um produto com este código ou descrição');
        return;
      }
      const newProduct = await createProduct({
        code: newProductCode.trim(),
        description: newProductDescription.trim(),
        item_type: newProductType
      });
      setProducts([...products, newProduct]);
      setNewProductCode('');
      setNewProductDescription('');
      setNewProductType('');
      toast.success('Produto adicionado com sucesso');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
    } finally {
      setIsLoading(false);
    }
  };
  const handleProductChange = (id: string, field: keyof Product, value: string) => {
    setEditedProducts({
      ...editedProducts,
      [id]: {
        ...(editedProducts[id] || {}),
        [field]: value
      }
    });
  };
  const handleSaveProducts = async () => {
    setIsLoading(true);
    try {
      const updates = Object.entries(editedProducts);
      if (updates.length === 0) {
        toast.info('Nenhuma alteração para salvar');
        setIsLoading(false);
        return;
      }
      for (const [id, data] of updates) {
        await updateProduct(id, data);
      }
      setProducts(products.map(p => {
        if (editedProducts[p.id]) {
          return {
            ...p,
            ...editedProducts[p.id]
          };
        }
        return p;
      }));
      setEditedProducts({});
      toast.success('Produtos atualizados com sucesso');
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('Erro ao atualizar produtos');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    setIsLoading(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));

      // Remove from edited state if present
      const {
        [id]: _,
        ...rest
      } = editedProducts;
      setEditedProducts(rest);
      toast.success('Produto excluído com sucesso');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setIsLoading(false);
    }
  };

  // Tare weights handlers
  const handleAddTareWeight = async () => {
    if (!newTareType) {
      toast.error('O tipo de tara é obrigatório');
      return;
    }
    if (newTareWeight < 0) {
      toast.error('O peso da tara deve ser maior ou igual a zero');
      return;
    }
    setIsLoading(true);
    try {
      // Check if tare for this type already exists
      const existingTare = tareWeights.find(tw => tw.item_type === newTareType);
      if (existingTare) {
        toast.error('Já existe uma tara para este tipo');
        return;
      }
      const newTare = await createTareWeight({
        item_type: newTareType,
        tare_kg: newTareWeight
      });
      setTareWeights([...tareWeights, newTare]);
      setNewTareType('');
      setNewTareWeight(0);
      toast.success('Tara adicionada com sucesso');
    } catch (error) {
      console.error('Error adding tare weight:', error);
      toast.error('Erro ao adicionar tara');
    } finally {
      setIsLoading(false);
    }
  };
  const handleTareWeightChange = (id: string, tare_kg: number) => {
    setEditedTareWeights({
      ...editedTareWeights,
      [id]: tare_kg
    });
  };
  const handleSaveTareWeights = async () => {
    setIsLoading(true);
    try {
      const updates = Object.entries(editedTareWeights);
      if (updates.length === 0) {
        toast.info('Nenhuma alteração para salvar');
        setIsLoading(false);
        return;
      }
      for (const [id, tare_kg] of updates) {
        await updateTareWeight(id, {
          tare_kg
        });
      }
      setTareWeights(tareWeights.map(tw => {
        if (editedTareWeights[tw.id] !== undefined) {
          return {
            ...tw,
            tare_kg: editedTareWeights[tw.id]
          };
        }
        return tw;
      }));
      setEditedTareWeights({});
      toast.success('Taras atualizadas com sucesso');
    } catch (error) {
      console.error('Error updating tare weights:', error);
      toast.error('Erro ao atualizar taras');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteTareWeight = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tara?')) {
      return;
    }
    setIsLoading(true);
    try {
      await deleteTareWeight(id);
      setTareWeights(tareWeights.filter(tw => tw.id !== id));

      // Remove from edited state if present
      const {
        [id]: _,
        ...rest
      } = editedTareWeights;
      setEditedTareWeights(rest);
      toast.success('Tara excluída com sucesso');
    } catch (error) {
      console.error('Error deleting tare weight:', error);
      toast.error('Erro ao excluir tara');
    } finally {
      setIsLoading(false);
    }
  };

  // Buyers handlers
  const handleAddBuyer = async () => {
    if (!newBuyerName.trim()) {
      toast.error('O nome do comprador é obrigatório');
      return;
    }
    if (!newBuyerPhone.trim()) {
      toast.error('O telefone do comprador é obrigatório');
      return;
    }
    if (newBuyerDocument && !validateDocument(newBuyerDocument)) {
      toast.error('Documento inválido');
      return;
    }
    setIsLoading(true);
    try {
      // Check if buyer already exists
      const existingByName = buyers.find(b => b.name.toLowerCase() === newBuyerName.trim().toLowerCase());
      if (existingByName) {
        toast.error('Já existe um comprador com este nome');
        setIsLoading(false);
        return;
      }
      const existingByPhone = buyers.find(b => b.phone === newBuyerPhone.replace(/\D/g, ''));
      if (existingByPhone) {
        toast.error('Já existe um comprador com este telefone');
        setIsLoading(false);
        return;
      }
      if (newBuyerDocument) {
        const existingByDocument = buyers.find(b => b.document === newBuyerDocument.replace(/\D/g, ''));
        if (existingByDocument) {
          toast.error('Já existe um comprador com este documento');
          setIsLoading(false);
          return;
        }
      }
      const newBuyer = await createBuyer({
        name: newBuyerName.trim(),
        phone: newBuyerPhone.replace(/\D/g, ''),
        document: newBuyerDocument ? newBuyerDocument.replace(/\D/g, '') : undefined,
        company: newBuyerCompany.trim() || undefined
      });
      setBuyers([...buyers, newBuyer]);
      setNewBuyerName('');
      setNewBuyerPhone('');
      setNewBuyerDocument('');
      setNewBuyerCompany('');
      toast.success('Comprador adicionado com sucesso');
    } catch (error) {
      console.error('Error adding buyer:', error);
      toast.error('Erro ao adicionar comprador');
    } finally {
      setIsLoading(false);
    }
  };
  const handleBuyerChange = (id: string, field: keyof Buyer, value: string) => {
    setEditedBuyers({
      ...editedBuyers,
      [id]: {
        ...(editedBuyers[id] || {}),
        [field]: value
      }
    });
  };
  const handleSaveBuyers = async () => {
    setIsLoading(true);
    try {
      const updates = Object.entries(editedBuyers);
      if (updates.length === 0) {
        toast.info('Nenhuma alteração para salvar');
        setIsLoading(false);
        return;
      }
      for (const [id, data] of updates) {
        await updateBuyer(id, data);
      }
      setBuyers(buyers.map(b => {
        if (editedBuyers[b.id]) {
          return {
            ...b,
            ...editedBuyers[b.id]
          };
        }
        return b;
      }));
      setEditedBuyers({});
      toast.success('Compradores atualizados com sucesso');
    } catch (error) {
      console.error('Error updating buyers:', error);
      toast.error('Erro ao atualizar compradores');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteBuyer = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este comprador?')) {
      return;
    }
    setIsLoading(true);
    try {
      await deleteBuyer(id);
      setBuyers(buyers.filter(b => b.id !== id));

      // Remove from edited state if present
      const {
        [id]: _,
        ...rest
      } = editedBuyers;
      setEditedBuyers(rest);
      toast.success('Comprador excluído com sucesso');
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast.error('Erro ao excluir comprador');
    } finally {
      setIsLoading(false);
    }
  };

  // Report Settings handlers
  const handleSaveReportSettings = async () => {
    setIsLoading(true);
    try {
      const updatedSettings = await updateSettings({
        report_footer1: reportFooter1.trim(),
        report_footer2: reportFooter2.trim()
      });
      setSettings(updatedSettings);
      toast.success('Configurações atualizadas com sucesso');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{
          color: "#3A86F7"
        }}>Configurações</h1>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="types" className="text-[#3A86F7]">Tipos de Pesagem</TabsTrigger>
          <TabsTrigger value="products" className="text-[#3A86F7]">Produtos</TabsTrigger>
          <TabsTrigger value="tare" className="text-[#3A86F7]">Taras</TabsTrigger>
          <TabsTrigger value="buyers" className="text-[#3A86F7]">Compradores</TabsTrigger>
          <TabsTrigger value="report" className="text-[#3A86F7]">Rodapé Relatório</TabsTrigger>
        </TabsList>

        {/* Types of Weighing */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{
              color: "#3A86F7"
            }}>Cadastro de Tipos de Pesagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end mb-6">
                <div className="space-y-2">
                  <Label htmlFor="newItemType">Tipo de Pesagem</Label>
                  <Input id="newItemType" value={newItemType} onChange={e => setNewItemType(e.target.value)} placeholder="Ex: Papelão, Osso, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newUnitPrice">Preço por kg (R$)</Label>
                  <NumberInput id="newUnitPrice" value={newUnitPrice} onChange={setNewUnitPrice} decimalPlaces={2} prefix="R$" />
                </div>
                <Button onClick={handleAddItemType} disabled={isLoading || !newItemType.trim() || newUnitPrice <= 0} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {isLoading ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div> : unitPrices.length === 0 ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum tipo de pesagem cadastrado.
                  </p>
                </div> : <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Tipo</th>
                          <th className="p-2 text-left">Preço por kg</th>
                          <th className="p-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unitPrices.map(unitPrice => <tr key={unitPrice.id} className="border-b">
                            <td className="p-2">
                              {unitPrice.item_type}
                            </td>
                            <td className="p-2">
                              <NumberInput value={editedUnitPrices[unitPrice.id] !== undefined ? editedUnitPrices[unitPrice.id] : unitPrice.price} onChange={newPrice => handleUnitPriceChange(unitPrice.id, newPrice)} decimalPlaces={2} prefix="R$" />
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItemType(unitPrice.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveUnitPrices} disabled={isLoading || Object.keys(editedUnitPrices).length === 0} size="sm" className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{
              color: "#3A86F7"
            }}>Cadastro de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_auto] gap-4 items-end mb-6">
                <div className="space-y-2">
                  <Label htmlFor="newProductCode">Código</Label>
                  <Input id="newProductCode" value={newProductCode} onChange={e => setNewProductCode(e.target.value)} placeholder="Código" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newProductDescription">Descrição</Label>
                  <Input id="newProductDescription" value={newProductDescription} onChange={e => setNewProductDescription(e.target.value)} placeholder="Descrição do produto" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newProductType">Tipo</Label>
                  <select id="newProductType" value={newProductType} onChange={e => setNewProductType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="">Selecione...</option>
                    {unitPrices.map(up => <option key={up.id} value={up.item_type}>
                        {up.item_type}
                      </option>)}
                  </select>
                </div>
                <Button onClick={handleAddProduct} disabled={isLoading || !newProductCode.trim() || !newProductDescription.trim() || !newProductType} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {isLoading ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div> : products.length === 0 ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum produto cadastrado.
                  </p>
                </div> : <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left" style={{ width: "15%" }}>Código</th>
                          <th className="p-2 text-left" style={{ width: "50%" }}>Descrição</th>
                          <th className="p-2 text-left" style={{ width: "25%" }}>Tipo</th>
                          <th className="p-2 text-right" style={{ width: "10%" }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => <tr key={product.id} className="border-b">
                            <td className="p-2" style={{ width: "15%" }}>
                              <Input value={editedProducts[product.id]?.code !== undefined ? editedProducts[product.id]?.code as string : product.code} onChange={e => handleProductChange(product.id, 'code', e.target.value)} className="w-full" />
                            </td>
                            <td className="p-2" style={{ width: "50%" }}>
                              <Input value={editedProducts[product.id]?.description !== undefined ? editedProducts[product.id]?.description as string : product.description} onChange={e => handleProductChange(product.id, 'description', e.target.value)} />
                            </td>
                            <td className="p-2" style={{ width: "25%" }}>
                              <select value={editedProducts[product.id]?.item_type !== undefined ? editedProducts[product.id]?.item_type as string : product.item_type} onChange={e => handleProductChange(product.id, 'item_type', e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
                                {unitPrices.map(up => <option key={up.id} value={up.item_type}>
                                    {up.item_type}
                                  </option>)}
                              </select>
                            </td>
                            <td className="p-2 text-right" style={{ width: "10%" }}>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveProducts} disabled={isLoading || Object.keys(editedProducts).length === 0} size="sm" className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tare Weights */}
        <TabsContent value="tare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{
              color: "#3A86F7"
            }}>Cadastro de Taras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end mb-6">
                <div className="space-y-2">
                  <Label htmlFor="newTareType">Tipo</Label>
                  <select id="newTareType" value={newTareType} onChange={e => setNewTareType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="">Selecione...</option>
                    {unitPrices.filter(up => !tareWeights.some(tw => tw.item_type === up.item_type)).map(up => <option key={up.id} value={up.item_type}>
                          {up.item_type}
                        </option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newTareWeight">Tara (kg)</Label>
                  <NumberInput id="newTareWeight" value={newTareWeight} onChange={setNewTareWeight} decimalPlaces={2} suffix="kg" />
                </div>
                <Button onClick={handleAddTareWeight} disabled={isLoading || !newTareType || newTareWeight < 0} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {isLoading ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div> : tareWeights.length === 0 ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma tara cadastrada.
                  </p>
                </div> : <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Tipo</th>
                          <th className="p-2 text-left">Tara (kg)</th>
                          <th className="p-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tareWeights.map(tareWeight => <tr key={tareWeight.id} className="border-b">
                            <td className="p-2">
                              {tareWeight.item_type}
                            </td>
                            <td className="p-2">
                              <NumberInput value={editedTareWeights[tareWeight.id] !== undefined ? editedTareWeights[tareWeight.id] : tareWeight.tare_kg} onChange={newTare => handleTareWeightChange(tareWeight.id, newTare)} decimalPlaces={2} suffix="kg" />
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteTareWeight(tareWeight.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveTareWeights} disabled={isLoading || Object.keys(editedTareWeights).length === 0} size="sm" className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buyers */}
        <TabsContent value="buyers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{
              color: "#3A86F7"
            }}>Cadastro de Compradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="newBuyerName">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input id="newBuyerName" value={newBuyerName} onChange={e => setNewBuyerName(e.target.value)} placeholder="Nome do comprador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBuyerPhone">
                    Telefone <span className="text-red-500">*</span>
                  </Label>
                  <Input id="newBuyerPhone" value={formatPhone(newBuyerPhone)} onChange={e => setNewBuyerPhone(e.target.value.replace(/\D/g, ''))} placeholder="(42) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBuyerDocument">
                    Documento (CPF, CNPJ ou RG)
                  </Label>
                  <Input id="newBuyerDocument" value={formatDocument(newBuyerDocument)} onChange={e => setNewBuyerDocument(e.target.value.replace(/\D/g, ''))} placeholder="Documento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBuyerCompany">Empresa</Label>
                  <Input id="newBuyerCompany" value={newBuyerCompany} onChange={e => setNewBuyerCompany(e.target.value)} placeholder="Nome da empresa (opcional)" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={handleAddBuyer} disabled={isLoading || !newBuyerName.trim() || !newBuyerPhone.trim() || newBuyerDocument && !validateDocument(newBuyerDocument)} size="sm" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Comprador
                  </Button>
                </div>
              </div>

              {isLoading ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div> : buyers.length === 0 ? <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum comprador cadastrado.
                  </p>
                </div> : <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Nome</th>
                          <th className="p-2 text-left">Telefone</th>
                          <th className="p-2 text-left">Documento</th>
                          <th className="p-2 text-left">Empresa</th>
                          <th className="p-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buyers.map(buyer => <tr key={buyer.id} className="border-b">
                            <td className="p-2">
                              <Input value={editedBuyers[buyer.id]?.name !== undefined ? editedBuyers[buyer.id]?.name as string : buyer.name} onChange={e => handleBuyerChange(buyer.id, 'name', e.target.value)} />
                            </td>
                            <td className="p-2">
                              <Input value={formatPhone(editedBuyers[buyer.id]?.phone !== undefined ? editedBuyers[buyer.id]?.phone as string : buyer.phone)} onChange={e => handleBuyerChange(buyer.id, 'phone', e.target.value.replace(/\D/g, ''))} />
                            </td>
                            <td className="p-2">
                              <Input value={formatDocument(editedBuyers[buyer.id]?.document !== undefined ? editedBuyers[buyer.id]?.document as string || '' : buyer.document || '')} onChange={e => handleBuyerChange(buyer.id, 'document', e.target.value.replace(/\D/g, '') || null)} />
                            </td>
                            <td className="p-2">
                              <Input value={editedBuyers[buyer.id]?.company !== undefined ? editedBuyers[buyer.id]?.company as string || '' : buyer.company || ''} onChange={e => handleBuyerChange(buyer.id, 'company', e.target.value || null)} />
                            </td>
                            <td className="p-2 text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBuyer(buyer.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveBuyers} disabled={isLoading || Object.keys(editedBuyers).length === 0} size="sm" className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Settings */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{
              color: "#3A86F7"
            }}>Configurações do Rodapé do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportFooter1">Rodapé Linha 1</Label>
                  <Input id="reportFooter1" value={reportFooter1} onChange={e => setReportFooter1(e.target.value)} placeholder="Texto da primeira linha do rodapé" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportFooter2">Rodapé Linha 2</Label>
                  <Input id="reportFooter2" value={reportFooter2} onChange={e => setReportFooter2(e.target.value)} placeholder="Texto da segunda linha do rodapé" />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveReportSettings} disabled={isLoading} size="sm" className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
const ConfigPageWrapper = () => {
  return <WeighingProvider>
      <ConfigPage />
    </WeighingProvider>;
};
export default ConfigPageWrapper;
