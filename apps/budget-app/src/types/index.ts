// ============================================================
// Core Types for Budget & Proposal App
// All 4 Phases: MVP, Templates, Analytics, Contracts
// ============================================================

// ---------- Enums ----------

export type PricingType = 'hourly' | 'fixed' | 'monthly_retainer' | 'per_sprint' | 'custom';

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'archived';

export type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export type UserRole = 'admin' | 'sales' | 'viewer';

export type BlockType = 'text' | 'service_table' | 'image' | 'terms' | 'signature' | 'divider' | 'heading';

export type ActivityType =
  | 'created'
  | 'updated'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'rejected'
  | 'commented'
  | 'signed'
  | 'invoice_created'
  | 'payment_received';

// ---------- Database Models ----------

export interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  email: string;
  phone: string | null;
  cnpj: string | null;
  address: Address | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  organization_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  cnpj: string | null;
  address: Address | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCatalogItem {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  pricing_type: PricingType;
  default_price: number;
  unit_label: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  organization_id: string;
  client_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  status: ProposalStatus;
  version: number;
  total_value: number;
  discount_percentage: number;
  discount_value: number;
  final_value: number;
  valid_until: string | null;
  public_token: string;
  blocks: ProposalBlock[];
  custom_fields: Record<string, string>;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Client;
  organization?: Organization;
  items?: ProposalItem[];
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  service_id: string | null;
  description: string;
  pricing_type: PricingType;
  unit_price: number;
  quantity: number;
  discount: number;
  total: number;
  sort_order: number;
  created_at: string;
}

export interface ProposalBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
  sort_order: number;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  snapshot: Record<string, unknown>;
  change_summary: string | null;
  created_by: string;
  created_at: string;
}

// ---------- Phase 2: Templates ----------

export interface Template {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  category: string | null;
  blocks: ProposalBlock[];
  default_items: Omit<ProposalItem, 'id' | 'proposal_id' | 'created_at'>[];
  default_valid_days: number;
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalComment {
  id: string;
  proposal_id: string;
  author_name: string;
  author_email: string;
  is_client: boolean;
  content: string;
  created_at: string;
}

export interface DigitalSignature {
  id: string;
  proposal_id: string;
  signer_name: string;
  signer_email: string;
  ip_address: string;
  user_agent: string;
  signed_at: string;
}

// ---------- Phase 3: Analytics ----------

export interface ProposalView {
  id: string;
  proposal_id: string;
  ip_address: string;
  user_agent: string;
  duration_seconds: number;
  viewed_at: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  proposal_id: string | null;
  contract_id: string | null;
  invoice_id: string | null;
  user_id: string | null;
  activity_type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_proposals: number;
  proposals_sent: number;
  proposals_approved: number;
  proposals_rejected: number;
  conversion_rate: number;
  average_deal_size: number;
  total_pipeline_value: number;
  average_time_to_close_days: number;
  monthly_revenue: number;
  proposals_by_status: Record<ProposalStatus, number>;
  revenue_by_month: { month: string; value: number }[];
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ---------- Phase 4: Contracts & Invoicing ----------

export interface Contract {
  id: string;
  organization_id: string;
  proposal_id: string;
  client_id: string;
  title: string;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
  terms: ContractTerms;
  total_value: number;
  signed_at: string | null;
  signed_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  proposal?: Proposal;
  client?: Client;
  invoices?: Invoice[];
}

export interface ContractTerms {
  payment_terms: string;
  delivery_terms: string;
  warranty_terms: string;
  cancellation_terms: string;
  custom_clauses: string[];
}

export interface ContractTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  content: string;
  merge_fields: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  contract_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  paid_at: string | null;
  paid_amount: number;
  is_recurring: boolean;
  recurrence_interval: 'monthly' | 'quarterly' | 'yearly' | null;
  next_recurrence_date: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  contract?: Contract;
  client?: Client;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  paid_at: string;
  created_at: string;
}

export interface FinancialReport {
  total_revenue: number;
  total_outstanding: number;
  total_overdue: number;
  invoices_by_status: Record<InvoiceStatus, number>;
  revenue_by_month: { month: string; revenue: number; invoiced: number }[];
  cash_flow_projection: { month: string; expected_income: number; expected_expenses: number }[];
  top_clients: { client_id: string; client_name: string; total_value: number }[];
}

// ---------- Form Types ----------

export type CreateClientForm = Omit<Client, 'id' | 'organization_id' | 'created_at' | 'updated_at'>;
export type UpdateClientForm = Partial<CreateClientForm>;

export type CreateServiceForm = Omit<ServiceCatalogItem, 'id' | 'organization_id' | 'created_at' | 'updated_at'>;
export type UpdateServiceForm = Partial<CreateServiceForm>;

export type CreateProposalForm = {
  client_id: string;
  template_id?: string;
  title: string;
  description?: string;
  valid_until?: string;
  items: Omit<ProposalItem, 'id' | 'proposal_id' | 'created_at'>[];
  blocks: ProposalBlock[];
  discount_percentage?: number;
  discount_value?: number;
  custom_fields?: Record<string, string>;
};

export type CreateContractForm = {
  proposal_id: string;
  title: string;
  start_date: string;
  end_date?: string;
  terms: ContractTerms;
};

export type CreateInvoiceForm = {
  contract_id: string;
  amount: number;
  tax_amount?: number;
  due_date: string;
  is_recurring?: boolean;
  recurrence_interval?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
};

// ---------- API Response Types ----------

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ---------- Webhook Types (Phase 4) ----------

export interface WebhookConfig {
  id: string;
  organization_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  organization_id: string;
  data: Record<string, unknown>;
}
