# Budget & Proposal App - MVP Phase 1

A modern web application for creating and managing business proposals, built specifically for tech companies with support for Brazilian market requirements.

## Features (Phase 1 - MVP)

- ✅ Authentication with Supabase
- ✅ Organization-based multi-tenancy
- ✅ Client Management (CRUD)
- ✅ Service Catalog Management (CRUD)
- ✅ Proposal Builder with drag-and-drop items
- ✅ Public shareable proposal links
- ✅ PDF generation
- ✅ Dashboard with metrics
- ✅ Support for multiple pricing models (hourly, fixed, retainer, per-sprint)
- ✅ Brazilian Real (BRL) currency formatting
- ✅ CNPJ field support

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **PDF**: @react-pdf/renderer
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Install dependencies:

```bash
cd apps/budget-app
npm install
```

2. Set up environment variables:

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then add your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Set up the database:

Run the SQL migration script in `supabase-schema.sql` in your Supabase SQL editor.

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Database Schema

See `supabase-schema.sql` for the complete database schema with Row Level Security (RLS) policies.

### Core Tables

- `organizations` - Company/organization data
- `user_profiles` - User profiles linked to organizations
- `clients` - Customer information
- `service_catalog` - Service offerings
- `proposals` - Proposal headers
- `proposal_items` - Line items within proposals
- `templates` - Reusable proposal templates

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components (sidebar, header)
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── lib/                 # Library code (Supabase client, constants)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── test/                # Test setup and utilities
```

## Key Concepts

### Multi-tenancy

The app uses organization-based multi-tenancy with Supabase Row Level Security (RLS). Every table has an `organization_id` column, and RLS policies ensure users can only access data from their own organization.

### Pricing Models

The service catalog supports various pricing models common in tech companies:

- **Hourly**: Rate per hour × estimated hours
- **Fixed**: One-time fixed price
- **Monthly Retainer**: Recurring monthly fee
- **Per Sprint**: Agile sprint-based pricing
- **Custom**: Free-form custom pricing

### Public Proposals

Each proposal has a unique `public_token` that allows clients to view proposals without authentication via a shareable link (`/p/:token`).

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Roadmap

### Phase 2: Templates & Workflow (Planned)
- Template system
- Content library
- Proposal versioning
- Email notifications
- Digital signature

### Phase 3: Analytics & Pipeline (Planned)
- Advanced metrics
- Proposal analytics
- Pipeline kanban view
- Team management

### Phase 4: Contract & Invoicing (Planned)
- Contract generation
- Invoice management
- Payment tracking
- Financial reports

## License

MIT

## Contributing

This is part of the Antigravity Awesome Skills project. See the main repository for contribution guidelines.
