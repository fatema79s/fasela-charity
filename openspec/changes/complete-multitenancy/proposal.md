# Change: Complete Multi-Tenancy Implementation

## Why

The platform needs to support multiple charity organizations, each with isolated data and independent operations. The database layer for multi-tenancy has been implemented (organizations table, RLS policies, org_id columns), but the application layer is missing - there's no UI for organization management, user assignment, or organization context handling.

## What Changes

### Frontend Application
- Add organization context provider to track current organization
- Add organization selector/switcher for multi-org users
- Display organization branding (name, logo) in layouts
- Filter all data queries through organization context

### Organization Management
- Add admin UI for creating and managing organizations
- Add organization settings page (name, slug, logo)
- Add organization member management

### User Onboarding & Assignment
- Add user invitation system (invite by email)
- Add user assignment to organizations during signup
- Add role management within organizations
- Support users belonging to multiple organizations

### Authentication Flow Updates
- Set organization context on login
- Handle organization selection for multi-org users
- Store organization preference in user profile

### Schema Finalization & Data Migration
- Add NOT NULL constraints to organization_id columns (after verifying backfill)
- Update user_roles unique constraint to support multi-org users
- Add is_super_admin flag for platform administrators
- Create org_invitations table for user onboarding
- Add soft-delete support (is_active) for organizations

## Impact

- **Affected specs**: New capabilities (org-management, org-context, user-onboarding, data-migration)
- **Affected code**:
  - `src/contexts/` - New OrganizationContext
  - `src/layouts/` - AdminLayout, PublicLayout updates
  - `src/pages/admin/` - New organization management pages
  - `src/components/` - Organization-aware components
  - `supabase/migrations/` - Minor schema additions (invitations table)
  - `src/integrations/supabase/` - Updated queries with org context

## Dependencies

- Existing database multi-tenancy migrations (already applied)
- Supabase Auth (already configured)
- User roles system (already exists)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data isolation breach | RLS policies already enforce isolation at DB level; frontend adds additional layer |
| Complex user flows | Phased rollout - single org first, then multi-org support |
| Performance overhead | Organization context cached in React state; minimal query overhead |
