import { z } from 'zod';

// ---------- Client Validation ----------

export const clientSchema = z.object({
  company_name: z.string().min(2, 'Nome da empresa e obrigatorio'),
  contact_name: z.string().min(2, 'Nome do contato e obrigatorio'),
  email: z.string().email('Email invalido'),
  phone: z.string().nullable().optional(),
  cnpj: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, '').length === 14,
      'CNPJ deve ter 14 digitos'
    ),
  address: z
    .object({
      street: z.string(),
      number: z.string(),
      complement: z.string().optional(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      zip_code: z.string(),
      country: z.string().default('Brasil'),
    })
    .nullable()
    .optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

// ---------- Service Catalog Validation ----------

export const serviceSchema = z.object({
  name: z.string().min(2, 'Nome do servico e obrigatorio'),
  category: z.string().min(1, 'Categoria e obrigatoria'),
  pricing_type: z.enum(['hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom']),
  default_price: z.number().min(0, 'Preco deve ser positivo'),
  unit_label: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

// ---------- Proposal Validation ----------

export const proposalItemSchema = z.object({
  service_id: z.string().nullable().optional(),
  description: z.string().min(1, 'Descricao e obrigatoria'),
  pricing_type: z.enum(['hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom']),
  unit_price: z.number().min(0, 'Preco deve ser positivo'),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  discount: z.number().min(0).max(100).default(0),
  sort_order: z.number().default(0),
});

export const proposalSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  template_id: z.string().uuid().optional(),
  title: z.string().min(3, 'Titulo deve ter ao menos 3 caracteres'),
  description: z.string().optional(),
  valid_until: z.string().optional(),
  items: z.array(proposalItemSchema).min(1, 'Adicione ao menos um item'),
  discount_percentage: z.number().min(0).max(100).default(0),
  discount_value: z.number().min(0).default(0),
  custom_fields: z.record(z.string()).optional(),
});

// ---------- Contract Validation ----------

export const contractSchema = z.object({
  proposal_id: z.string().uuid('Selecione uma proposta'),
  title: z.string().min(3, 'Titulo e obrigatorio'),
  start_date: z.string().min(1, 'Data de inicio e obrigatoria'),
  end_date: z.string().optional(),
  terms: z.object({
    payment_terms: z.string().default(''),
    delivery_terms: z.string().default(''),
    warranty_terms: z.string().default(''),
    cancellation_terms: z.string().default(''),
    custom_clauses: z.array(z.string()).default([]),
  }),
});

// ---------- Invoice Validation ----------

export const invoiceSchema = z.object({
  contract_id: z.string().uuid('Selecione um contrato'),
  amount: z.number().positive('Valor deve ser positivo'),
  tax_amount: z.number().min(0).default(0),
  due_date: z.string().min(1, 'Data de vencimento e obrigatoria'),
  is_recurring: z.boolean().default(false),
  recurrence_interval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  notes: z.string().optional(),
});

// ---------- Organization Validation ----------

export const organizationSchema = z.object({
  name: z.string().min(2, 'Nome da empresa e obrigatorio'),
  email: z.string().email('Email invalido'),
  phone: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  primary_color: z.string().default('#3B82F6'),
  secondary_color: z.string().default('#1E40AF'),
});

// ---------- Template Validation ----------

export const templateSchema = z.object({
  name: z.string().min(2, 'Nome do template e obrigatorio'),
  description: z.string().optional(),
  category: z.string().optional(),
  default_valid_days: z.number().min(1).default(30),
});

// ---------- Content Block Validation ----------

export const contentBlockSchema = z.object({
  title: z.string().min(2, 'Titulo e obrigatorio'),
  category: z.string().min(1, 'Categoria e obrigatoria'),
  content: z.string().min(1, 'Conteudo e obrigatorio'),
  tags: z.array(z.string()).default([]),
});

// ---------- Comment Validation ----------

export const commentSchema = z.object({
  author_name: z.string().min(2, 'Nome e obrigatorio'),
  author_email: z.string().email('Email invalido'),
  content: z.string().min(1, 'Comentario e obrigatorio'),
});

// ---------- Payment Validation ----------

export const paymentSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  payment_method: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// ---------- Webhook Validation ----------

export const webhookSchema = z.object({
  url: z.string().url('URL invalida'),
  events: z.array(z.string()).min(1, 'Selecione ao menos um evento'),
  is_active: z.boolean().default(true),
});

// Export types inferred from schemas
export type ClientFormData = z.infer<typeof clientSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type ProposalFormData = z.infer<typeof proposalSchema>;
export type ContractFormData = z.infer<typeof contractSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type TemplateFormData = z.infer<typeof templateSchema>;
export type ContentBlockFormData = z.infer<typeof contentBlockSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type WebhookFormData = z.infer<typeof webhookSchema>;
