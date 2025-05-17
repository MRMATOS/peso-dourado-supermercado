import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Brazilian Real
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Format weight in kg
export function formatWeight(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(value) + ' kg';
}

// Format date to Brazilian format
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

// Format date and time to Brazilian format
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Parse a Brazilian formatted number (with comma as decimal separator)
export function parseNumber(value: string): number {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}

// Format number with Brazilian decimal separator
export function formatNumber(value: number, decimalPlaces: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

// Validate CPF
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Check for all same digits
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder > 9 ? 0 : remainder;
  
  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder > 9 ? 0 : remainder;
  
  // Check if calculated digits match the provided ones
  return (
    parseInt(cleanCPF.charAt(9)) === digit1 &&
    parseInt(cleanCPF.charAt(10)) === digit2
  );
}

// Validate CNPJ
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return false;
  
  // Check for all same digits
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Calculate first verification digit
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Calculate second verification digit
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

// Validate RG (simplified, just checks length)
export function validateRG(rg: string): boolean {
  const cleanRG = rg.replace(/\D/g, '');
  return cleanRG.length >= 5 && cleanRG.length <= 10;
}

// Validate document (CPF, CNPJ or RG)
export function validateDocument(document: string, type?: 'CPF' | 'CNPJ' | 'RG'): boolean {
  if (!document) return true; // Empty is valid (optional field)
  
  const cleanDoc = document.replace(/\D/g, '');
  
  if (type) {
    switch (type) {
      case 'CPF': return validateCPF(cleanDoc);
      case 'CNPJ': return validateCNPJ(cleanDoc);
      case 'RG': return validateRG(cleanDoc);
    }
  } else {
    // Auto-detect type by length
    if (cleanDoc.length === 11) return validateCPF(cleanDoc);
    if (cleanDoc.length === 14) return validateCNPJ(cleanDoc);
    if (cleanDoc.length >= 5 && cleanDoc.length <= 10) return validateRG(cleanDoc);
  }
  
  return false;
}

// Format document (CPF, CNPJ or RG)
export function formatDocument(document: string): string {
  const cleanDoc = document.replace(/\D/g, '');
  
  // Format CPF: 000.000.000-00
  if (cleanDoc.length === 11) {
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // Format CNPJ: 00.000.000/0000-00
  if (cleanDoc.length === 14) {
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  // For RG, just return clean digits
  return cleanDoc;
}

// Format phone number: (00) 00000-0000
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return cleanPhone;
}
