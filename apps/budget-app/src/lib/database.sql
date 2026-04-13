-- ============================================================
-- Budget & Proposal App - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Organizations ----------
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  email TEXT NOT NULL,
  phone TEXT,
  cnpj TEXT,
  address JSONB,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Users ----------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'sales', 'viewer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Clients ----------
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
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Service Catalog ----------
CREATE TABLE service_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom')),
  default_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unit_label TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Templates (Phase 2) ----------
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  blocks JSONB DEFAULT '[]'::jsonb,
  default_items JSONB DEFAULT '[]'::jsonb,
  default_valid_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Content Library (Phase 2) ----------
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Proposals ----------
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  template_id UUID REFERENCES templates(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'archived')),
  version INTEGER DEFAULT 1,
  total_value DECIMAL(12, 2) DEFAULT 0,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_value DECIMAL(12, 2) DEFAULT 0,
  final_value DECIMAL(12, 2) DEFAULT 0,
  valid_until DATE,
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  blocks JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Proposal Items ----------
CREATE TABLE proposal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_catalog(id),
  description TEXT NOT NULL,
  pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('hourly', 'fixed', 'monthly_retainer', 'per_sprint', 'custom')),
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  discount DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Proposal Versions (Phase 2) ----------
CREATE TABLE proposal_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Proposal Comments (Phase 2) ----------
CREATE TABLE proposal_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  is_client BOOLEAN DEFAULT false,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Digital Signatures (Phase 2) ----------
CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Proposal Views (Phase 3) ----------
CREATE TABLE proposal_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  duration_seconds INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Activity Log (Phase 3) ----------
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  contract_id UUID,
  invoice_id UUID,
  user_id UUID REFERENCES users(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Notifications (Phase 3) ----------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Contracts (Phase 4) ----------
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  terms JSONB DEFAULT '{}'::jsonb,
  total_value DECIMAL(12, 2) DEFAULT 0,
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK to activity_log
ALTER TABLE activity_log ADD CONSTRAINT fk_activity_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL;

-- ---------- Contract Templates (Phase 4) ----------
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  merge_fields TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Invoices (Phase 4) ----------
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval TEXT CHECK (recurrence_interval IN ('monthly', 'quarterly', 'yearly')),
  next_recurrence_date DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK to activity_log
ALTER TABLE activity_log ADD CONSTRAINT fk_activity_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- ---------- Payments (Phase 4) ----------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Webhooks (Phase 4) ----------
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security Policies
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's organization
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: users can only see their own org
CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (id = get_user_org_id());

-- Users: same org only
CREATE POLICY "users_select" ON users FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "users_update" ON users FOR UPDATE USING (organization_id = get_user_org_id());

-- Generic org-scoped policies for all other tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'clients', 'service_catalog', 'templates', 'content_blocks',
    'proposals', 'activity_log', 'notifications', 'contracts',
    'contract_templates', 'invoices', 'webhook_configs'
  ])
  LOOP
    EXECUTE format('CREATE POLICY "%s_select" ON %I FOR SELECT USING (organization_id = get_user_org_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_insert" ON %I FOR INSERT WITH CHECK (organization_id = get_user_org_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_update" ON %I FOR UPDATE USING (organization_id = get_user_org_id())', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_delete" ON %I FOR DELETE USING (organization_id = get_user_org_id())', tbl, tbl);
  END LOOP;
END $$;

-- Proposal items: access via proposal ownership
CREATE POLICY "items_select" ON proposal_items FOR SELECT
  USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));
CREATE POLICY "items_insert" ON proposal_items FOR INSERT
  WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));
CREATE POLICY "items_update" ON proposal_items FOR UPDATE
  USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));
CREATE POLICY "items_delete" ON proposal_items FOR DELETE
  USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));

-- Proposal versions: access via proposal
CREATE POLICY "versions_select" ON proposal_versions FOR SELECT
  USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));
CREATE POLICY "versions_insert" ON proposal_versions FOR INSERT
  WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));

-- Comments: org users + public via proposal token (handled at app level)
CREATE POLICY "comments_select" ON proposal_comments FOR SELECT
  USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));
CREATE POLICY "comments_insert" ON proposal_comments FOR INSERT
  WITH CHECK (true); -- Public can comment via token
CREATE POLICY "comments_select_public" ON proposal_comments FOR SELECT
  USING (true); -- Public can read comments

-- Digital signatures: public can sign
CREATE POLICY "signatures_select" ON digital_signatures FOR SELECT USING (true);
CREATE POLICY "signatures_insert" ON digital_signatures FOR INSERT WITH CHECK (true);

-- Proposal views: public can create views
CREATE POLICY "views_select" ON proposal_views FOR SELECT
  USING (proposal_id IN (SELECT id FROM proposals WHERE organization_id = get_user_org_id()));
CREATE POLICY "views_insert" ON proposal_views FOR INSERT WITH CHECK (true);

-- Payments: access via invoice -> contract -> org
CREATE POLICY "payments_select" ON payments FOR SELECT
  USING (invoice_id IN (SELECT id FROM invoices WHERE organization_id = get_user_org_id()));
CREATE POLICY "payments_insert" ON payments FOR INSERT
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE organization_id = get_user_org_id()));
CREATE POLICY "payments_delete" ON payments FOR DELETE
  USING (invoice_id IN (SELECT id FROM invoices WHERE organization_id = get_user_org_id()));

-- ============================================================
-- Indexes for Performance
-- ============================================================

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_service_catalog_org ON service_catalog(organization_id);
CREATE INDEX idx_proposals_org ON proposals(organization_id);
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_token ON proposals(public_token);
CREATE INDEX idx_proposal_items_proposal ON proposal_items(proposal_id);
CREATE INDEX idx_templates_org ON templates(organization_id);
CREATE INDEX idx_content_blocks_org ON content_blocks(organization_id);
CREATE INDEX idx_proposal_views_proposal ON proposal_views(proposal_id);
CREATE INDEX idx_activity_log_org ON activity_log(organization_id);
CREATE INDEX idx_activity_log_proposal ON activity_log(proposal_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_contracts_org ON contracts(organization_id);
CREATE INDEX idx_contracts_proposal ON contracts(proposal_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_contract ON invoices(contract_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- ============================================================
-- Updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'organizations', 'users', 'clients', 'service_catalog',
    'templates', 'content_blocks', 'proposals', 'contracts',
    'contract_templates', 'invoices'
  ])
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================
-- Auto-calculate proposal totals trigger
-- ============================================================

CREATE OR REPLACE FUNCTION recalculate_proposal_totals()
RETURNS TRIGGER AS $$
DECLARE
  subtotal DECIMAL(12, 2);
  disc_pct DECIMAL(5, 2);
  disc_val DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO subtotal
  FROM proposal_items
  WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  SELECT discount_percentage, discount_value INTO disc_pct, disc_val
  FROM proposals
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  UPDATE proposals SET
    total_value = subtotal,
    final_value = subtotal - disc_val - (subtotal * disc_pct / 100)
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_proposal
AFTER INSERT OR UPDATE OR DELETE ON proposal_items
FOR EACH ROW EXECUTE FUNCTION recalculate_proposal_totals();

-- ============================================================
-- Auto-generate invoice number
-- ============================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  org_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO org_count
  FROM invoices
  WHERE organization_id = NEW.organization_id;

  NEW.invoice_number = 'INV-' || LPAD(org_count::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();
