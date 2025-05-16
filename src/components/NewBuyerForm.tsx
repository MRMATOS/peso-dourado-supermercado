
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDocument, validateDocument, formatPhone } from '@/lib/utils';
import { Buyer } from '@/types/database';

interface NewBuyerFormProps {
  onBuyerCreated: (buyer: Buyer) => void;
  onCancel: () => void;
}

const NewBuyerForm = ({ onBuyerCreated, onCancel }: NewBuyerFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = async () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    // Document validation
    if (document && !validateDocument(document)) {
      newErrors.document = 'Documento inválido (CPF, CNPJ ou RG)';
    }

    // Check for duplicates
    if (name.trim()) {
      const { data: existingName } = await supabase
        .from('buyers')
        .select('id')
        .eq('name', name.trim())
        .maybeSingle();

      if (existingName) {
        newErrors.name = 'Já existe um comprador com este nome';
      }
    }

    if (phone.trim()) {
      const { data: existingPhone } = await supabase
        .from('buyers')
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (existingPhone) {
        newErrors.phone = 'Já existe um comprador com este telefone';
      }
    }

    if (document.trim()) {
      const { data: existingDocument } = await supabase
        .from('buyers')
        .select('id')
        .eq('document', document.trim())
        .maybeSingle();

      if (existingDocument) {
        newErrors.document = 'Já existe um comprador com este documento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await validate();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('buyers')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          document: document.trim() || null,
          company: company.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Comprador cadastrado com sucesso');
      onBuyerCreated(data as Buyer);
    } catch (error) {
      console.error('Error creating buyer:', error);
      toast.error('Erro ao cadastrar comprador');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setDocument(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do comprador"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Telefone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          value={formatPhone(phone)}
          onChange={handlePhoneChange}
          placeholder="(42) 00000-0000"
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">
          Documento (CPF, CNPJ ou RG)
        </Label>
        <Input
          id="document"
          value={formatDocument(document)}
          onChange={handleDocumentChange}
          placeholder="Documento"
          className={errors.document ? 'border-red-500' : ''}
        />
        {errors.document && (
          <p className="text-red-500 text-sm">{errors.document}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Nome da empresa (opcional)"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default NewBuyerForm;
