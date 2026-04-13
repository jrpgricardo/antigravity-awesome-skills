# PropostaApp - Budget & Proposal App

A complete budget and proposal management application for technology companies. Built with React 19, TypeScript, Tailwind CSS, and Supabase.

## Features

### Phase 1: Foundation (MVP)
- **Authentication**: Email/password login with Supabase Auth
- **Service Catalog**: CRUD for services with pricing types (hourly, fixed, retainer, sprint, custom)
- **Client Management**: Full client CRUD with CNPJ, address, notes
- **Proposal Builder**: Create proposals with items from service catalog, discounts, validation
- **PDF Generation**: Professional PDF export with company branding via @react-pdf/renderer
- **Public Proposal Link**: Shareable links for clients to view proposals online
- **Dashboard**: Overview with metrics, recent proposals, quick stats

### Phase 2: Templates & Workflow
- **Template System**: Reusable proposal templates with configurable defaults
- **Content Library**: Reusable text blocks (terms, SLAs, scope descriptions)
- **Proposal Workflow**: Draft -> Sent -> Viewed -> Approved/Rejected/Expired
- **Proposal Versioning**: Track changes across revisions
- **Client Portal**: Clients can view, comment, and approve proposals
- **Digital Signatures**: Approval with name, email, IP, and timestamp logging

### Phase 3: Analytics & Pipeline
- **Dashboard Metrics**: Conversion rate, deal size, pipeline value, revenue
- **Pipeline Kanban**: Visual board of proposals by status
- **Proposal Analytics**: View tracking (who viewed, when, duration)
- **Activity Timeline**: Full history log of all interactions
- **Notifications**: Real-time alerts for proposal activity
- **Team Management**: Admin, sales, viewer roles

### Phase 4: Contracts & Invoicing
- **Contract Generation**: Auto-generate contracts from approved proposals
- **Contract Templates**: Customizable legal templates with merge fields
- **Invoice Generation**: Create invoices from contracts (one-time or recurring)
- **Payment Tracking**: Partial payments, payment methods, references
- **Financial Reports**: Revenue, outstanding, overdue, cash flow, top clients
- **Webhooks**: External system integration via configurable webhooks

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Build | Vite |
| Backend/DB | Supabase (Postgres + Auth + Storage + RLS) |
| PDF | @react-pdf/renderer |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Routing | React Router v7 |

## Getting Started

### 1. Install dependencies

```bash
cd apps/budget-app
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key
3. Run the SQL schema in `src/lib/database.sql` in the Supabase SQL Editor

### 3. Run the app

```bash
npm run dev
```

### 4. Create your account

Open the app and click "Criar Conta" to create your organization and admin account.

## Project Structure

```
src/
  components/
    ui/           # Shared UI components (Button, Input, Modal, Badge, etc.)
    layout/       # App shell (Sidebar, Header, AppLayout)
    pdf/          # PDF generation components
  pages/          # Route-level page components
  stores/         # Zustand state stores
  lib/            # Supabase client, DB schema
  types/          # TypeScript type definitions
  utils/          # Utilities (currency, calculations, validators)
```

## Database

The complete database schema is in `src/lib/database.sql` and includes:
- 18+ tables with full relationships
- Row Level Security (RLS) policies for multi-tenancy
- Auto-updating timestamps
- Auto-calculating proposal totals
- Auto-generating invoice numbers
- Performance indexes

## Pricing Models

Designed for tech companies with support for:
- **Hourly**: Rate/hour x estimated hours
- **Fixed**: One-time fixed price
- **Monthly Retainer**: Monthly rate x duration
- **Per Sprint**: Sprint price x number of sprints
- **Custom**: Free-form pricing
