# Project Context

## Purpose
Yateem Care Connect is a transparent family sponsorship platform (كفالة الأسر) that enables donors to sponsor families in need with comprehensive monthly follow-ups and periodic reports. The platform provides:

- Public-facing case listings for families in need
- Donation management (monthly and custom donations)
- Monthly follow-up tracking and reporting
- Task management for case workers
- Multi-organization support (multi-tenant architecture)
- Admin dashboard for case management
- Transparency reports for donors

The application is built for Arabic-speaking users with full RTL (right-to-left) support.

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query (React Query) 5.56** - Server state management and data fetching

### UI & Styling
- **shadcn-ui** - Component library built on Radix UI
- **Radix UI** - Accessible component primitives
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Cairo Font** - Arabic typography
- **Framer Motion 12.23** - Animation library
- **Lucide React** - Icon library

### Forms & Validation
- **React Hook Form 7.53** - Form state management
- **Zod 3.23** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS) policies
  - Authentication
  - Real-time subscriptions (when needed)

### Additional Libraries
- **date-fns 3.6** - Date manipulation
- **recharts 2.12** - Data visualization
- **sonner 1.5** - Toast notifications
- **cmdk 1.0** - Command palette component

## Project Conventions

### Code Style

#### TypeScript Configuration
- Path aliases: `@/` maps to `./src/`
- Relaxed strict mode: `noImplicitAny: false`, `strictNullChecks: false`
- Unused variables/parameters warnings disabled (for flexibility during development)

#### ESLint Rules
- Uses TypeScript ESLint recommended config
- React Hooks rules enforced
- React Refresh plugin for HMR
- Unused vars rule disabled

#### File Organization
```
src/
├── components/     # Reusable UI components
│   ├── admin/     # Admin-specific components
│   ├── layouts/   # Layout components
│   └── ui/        # shadcn-ui components
├── pages/         # Route components
├── contexts/      # React Context providers
├── hooks/         # Custom React hooks
├── integrations/  # External service integrations (Supabase)
└── lib/           # Utility functions
```

#### Naming Conventions
- Components: PascalCase (e.g., `AdminDashboard.tsx`)
- Files: Match component/export name
- Hooks: `use` prefix (e.g., `useOrganization.ts`)
- Utilities: camelCase (e.g., `utils.ts`)

#### Code Formatting
- No explicit formatter config found (likely using editor defaults)
- Prefer functional components with hooks
- Use TypeScript interfaces for type definitions

### Architecture Patterns

#### Component Architecture
- **Component-based**: Reusable, composable React components
- **Layout Components**: Separate layouts for public (`PublicLayout`) and admin (`AdminLayout`) sections
- **Page Components**: Route-level components in `pages/` directory
- **UI Components**: shadcn-ui components in `components/ui/`

#### State Management
- **TanStack Query**: Server state, caching, and data fetching
- **React Context**: Organization context for multi-tenant support
- **Local State**: React hooks (`useState`, `useReducer`) for component-level state
- **URL State**: React Router for route-based state

#### Data Fetching
- All Supabase queries go through TanStack Query
- Custom hooks for common queries (e.g., `useOrgQuery.ts`)
- Supabase client singleton pattern (`@/integrations/supabase/client`)

#### Multi-Tenancy
- Organization-based data isolation
- `OrganizationContext` manages current organization selection
- Supabase RLS policies enforce organization-level access control
- Super admin role for cross-organization access

#### Routing
- React Router v6 with nested routes
- Public routes wrapped in `PublicLayout`
- Admin routes wrapped in `AdminLayout`
- Standalone routes for special pages (e.g., `/mom-survey`)

#### Security
- Supabase Row Level Security (RLS) policies on all tables
- Role-based access control (`admin`, `volunteer`, `user`)
- Organization-scoped data access
- Super admin capabilities for system-wide access

### Testing Strategy
- **Current State**: No test files found in the codebase
- **Recommendation**: Consider adding tests for:
  - Critical business logic
  - Form validation
  - Data transformation utilities
  - RLS policy behavior (via Supabase test suite)

### Git Workflow
- No explicit git workflow documented
- Standard feature branch workflow assumed
- Migrations tracked in `supabase/migrations/` with timestamped SQL files

## Domain Context

### Core Entities

#### Cases (Families)
- Represent families in need of sponsorship
- Have monthly financial needs
- Tracked through case pipeline stages
- Can be published (public) or unpublished (admin-only)
- Linked to organizations (multi-tenant)

#### Kids
- Children within cases
- Individual profiles and information
- Can have individual tasks and follow-ups

#### Donations
- **Monthly donations**: Recurring sponsorship commitments
- **Custom donations**: One-time contributions
- Status: `pending`, `confirmed`, `cancelled`
- Tracked with payment codes and references

#### Follow-ups
- Monthly check-ins with families
- Types: `visit`, `call`, `meeting`, `other`
- Linked to cases and can generate tasks

#### Tasks
- Action items for case workers
- Types: `admin_action`, `case_action`, `both`
- Assigned to: `admin`, `case`, `both`
- Priorities: `low`, `medium`, `high`, `urgent`
- Status: `pending`, `in_progress`, `completed`, `cancelled`

#### Monthly Needs & Handovers
- Monthly financial requirements per case
- Handover tracking for delivery of funds
- Calendar view for scheduling

#### Organizations
- Multi-tenant structure
- Each organization has its own cases, users, and data
- Users can belong to multiple organizations with different roles
- Super admins can access all organizations

#### Charities
- External charity organizations
- Can support cases with monthly amounts
- Tracked via `case_charities` junction table

### User Roles
- **Super Admin**: Cross-organization access, system-wide management
- **Admin**: Full access within their organization(s)
- **Volunteer**: Limited admin access within organization
- **User**: Basic authenticated user
- **Public**: Unauthenticated users (read-only access to published cases)

### Workflows
1. **Case Pipeline**: Cases move through stages from intake to active sponsorship
2. **Donation Flow**: Public donation → Payment → Admin confirmation → Case funding
3. **Monthly Follow-up**: Scheduled follow-ups → Task generation → Completion tracking
4. **Reporting**: Monthly reports generated for donors and administrators

## Important Constraints

### Technical Constraints
- **RTL Support**: Full right-to-left layout required for Arabic content
- **Arabic Typography**: Cairo font family for proper Arabic text rendering
- **Supabase RLS**: All database access must respect Row Level Security policies
- **Multi-Tenancy**: All data queries must be organization-scoped (except super admin)
- **Browser Storage**: Uses `localStorage` for organization selection persistence

### Business Constraints
- **Transparency**: Published cases and confirmed donations are publicly visible
- **Privacy**: Unpublished cases and pending donations are admin-only
- **Data Isolation**: Organizations cannot access each other's data (except super admin)
- **Audit Trail**: Donations, follow-ups, and tasks track creation/update timestamps and user IDs

### Regulatory Constraints
- None explicitly documented, but consider:
  - Data privacy regulations (GDPR, local privacy laws)
  - Financial transaction reporting requirements
  - Charity/non-profit compliance requirements

## External Dependencies

### Supabase
- **URL**: `https://xbwnjfdzbnyvaxmqufrw.supabase.co`
- **Services Used**:
  - PostgreSQL database with RLS
  - Authentication (email/password)
  - Storage (if used for file uploads)
- **Key Features**:
  - Row Level Security policies
  - Database functions for complex queries
  - Real-time subscriptions (when needed)
- **Migration Management**: SQL migrations in `supabase/migrations/`

### Lovable Platform
- **Project URL**: https://lovable.dev/projects/851f4252-df08-4d8d-8344-541c2f9aa45d
- Used for initial project scaffolding and deployment
- Auto-commits changes made via Lovable interface

### Google Fonts
- **Cairo Font**: Loaded from Google Fonts CDN for Arabic typography
- Preconnect headers configured for performance

### Payment Processing
- Payment codes and references tracked in donations table
- Actual payment processing likely handled externally (not visible in codebase)
