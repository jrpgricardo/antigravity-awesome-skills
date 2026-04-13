-- Budget & Proposal App - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles table (links auth.users to organizations)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'sales', 'viewer')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cnpj TEXT,
  address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service catalog table
CREATE TABLE service_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom')),
  default_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  template_id UUID,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired')),
  total_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valid_until DATE,
  public_token TEXT NOT NULL UNIQUE,
  custom_fields JSONB,
  notes TEXT,
  introduction TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Proposal items table
CREATE TABLE proposal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_catalog(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom')),
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  discount DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  introduction TEXT,
  terms TEXT,
  custom_fields JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposal versions table (for tracking changes)
CREATE TABLE proposal_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_service_catalog_organization_id ON service_catalog(organization_id);
CREATE INDEX idx_proposals_organization_id ON proposals(organization_id);
CREATE INDEX idx_proposals_client_id ON proposals(client_id);
CREATE INDEX idx_proposals_public_token ON proposals(public_token);
CREATE INDEX idx_proposal_items_proposal_id ON proposal_items(proposal_id);
CREATE INDEX idx_templates_organization_id ON templates(organization_id);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for user_profiles
CREATE POLICY "Users can view profiles in their organization"
  ON user_profiles FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for clients
CREATE POLICY "Users can view clients in their organization"
  ON clients FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert clients in their organization"
  ON clients FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update clients in their organization"
  ON clients FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete clients in their organization"
  ON clients FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for service_catalog
CREATE POLICY "Users can view services in their organization"
  ON service_catalog FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert services in their organization"
  ON service_catalog FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update services in their organization"
  ON service_catalog FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete services in their organization"
  ON service_catalog FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for proposals
CREATE POLICY "Users can view proposals in their organization"
  ON proposals FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    OR public_token IS NOT NULL  -- Allow public access via token
  );

CREATE POLICY "Users can insert proposals in their organization"
  ON proposals FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update proposals in their organization"
  ON proposals FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete proposals in their organization"
  ON proposals FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for proposal_items
CREATE POLICY "Users can view proposal items in their organization"
  ON proposal_items FOR SELECT
  USING (proposal_id IN (
    SELECT id FROM proposals WHERE organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert proposal items in their organization"
  ON proposal_items FOR INSERT
  WITH CHECK (proposal_id IN (
    SELECT id FROM proposals WHERE organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update proposal items in their organization"
  ON proposal_items FOR UPDATE
  USING (proposal_id IN (
    SELECT id FROM proposals WHERE organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete proposal items in their organization"
  ON proposal_items FOR DELETE
  USING (proposal_id IN (
    SELECT id FROM proposals WHERE organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

-- RLS Policies for templates
CREATE POLICY "Users can view templates in their organization"
  ON templates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert templates in their organization"
  ON templates FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update templates in their organization"
  ON templates FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete templates in their organization"
  ON templates FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_catalog_updated_at BEFORE UPDATE ON service_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
