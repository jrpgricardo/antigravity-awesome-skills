// Core domain types for the Budget & Proposal App

export type PricingType = 'hourly' | 'fixed' | 'monthly_retainer' | 'per_sprint' | 'custom';

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: Address;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  organization_id: string;
  role: 'admin' | 'sales' | 'viewer';
  full_name?: string;
  created_at: string;
}

export interface Client {
  id: string;
  organization_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  cnpj?: string;
  address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCatalog {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  pricing_type: PricingType;
  default_price: number;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  organization_id: string;
  client_id: string;
  template_id?: string;
  title: string;
  status: ProposalStatus;
  total_value: number;
  valid_until?: string;
  public_token: string;
  custom_fields?: Record<string, any>;
  notes?: string;
  introduction?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Relations (loaded separately)
  client?: Client;
  items?: ProposalItem[];
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  service_id?: string;
  description: string;
  pricing_type: PricingType;
  unit_price: number;
  quantity: number;
  discount: number;
  total: number;
  sort_order: number;
  
  // Relations
  service?: ServiceCatalog;
}

export interface Template {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  introduction?: string;
  terms?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  snapshot: any;
  created_at: string;
  created_by: string;
}

// Form types
export interface ProposalFormData {
  title: string;
  client_id: string;
  valid_until?: string;
  introduction?: string;
  terms?: string;
  notes?: string;
  items: ProposalItemFormData[];
}

export interface ProposalItemFormData {
  service_id?: string;
  description: string;
  pricing_type: PricingType;
  unit_price: number;
  quantity: number;
  discount: number;
}

export interface ClientFormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  cnpj?: string;
  address?: Address;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  category: string;
  pricing_type: PricingType;
  default_price: number;
  description: string;
  active: boolean;
}

// Analytics types
export interface DashboardMetrics {
  total_proposals: number;
  approved_proposals: number;
  pending_proposals: number;
  total_value: number;
  conversion_rate: number;
  average_deal_size: number;
}

// Database types (matching Supabase schema)
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at'>>;
      };
      service_catalog: {
        Row: ServiceCatalog;
        Insert: Omit<ServiceCatalog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceCatalog, 'id' | 'created_at'>>;
      };
      proposals: {
        Row: Proposal;
        Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'public_token'>;
        Update: Partial<Omit<Proposal, 'id' | 'created_at' | 'public_token'>>;
      };
      proposal_items: {
        Row: ProposalItem;
        Insert: Omit<ProposalItem, 'id'>;
        Update: Partial<Omit<ProposalItem, 'id' | 'proposal_id'>>;
      };
      templates: {
        Row: Template;
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Template, 'id' | 'created_at'>>;
      };
    };
  };
}
