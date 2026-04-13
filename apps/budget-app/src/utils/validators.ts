import { z } from 'zod';

// Client validation schema
export const clientSchema = z.object({
  company_name: z.string().min(1, 'Nome da empresa é obrigatório'),
  contact_name: z.string().min(1, 'Nome do contato é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// Service validation schema
export const serviceSchema = z.object({
  name: z.string().min(1, 'Nome do serviço é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  pricing_type: z.enum(['hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom']),
  default_price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  active: z.boolean(),
});

// Proposal item validation schema
export const proposalItemSchema = z.object({
  service_id: z.string().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  pricing_type: z.enum(['hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom']),
  unit_price: z.number().min(0, 'Preço unitário deve ser maior ou igual a zero'),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  discount: z.number().min(0).max(100, 'Desconto deve estar entre 0 e 100'),
});

// Proposal validation schema
export const proposalSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  valid_until: z.string().optional(),
  introduction: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(proposalItemSchema).min(1, 'Adicione pelo menos um item'),
});

// CNPJ validation (basic format check)
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/[^\d]/g, '');
  return cleaned.length === 14;
}

// Format CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/[^\d]/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
