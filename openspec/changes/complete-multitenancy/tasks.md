# Tasks: Complete Multi-Tenancy Implementation

## Phase 0: Schema Finalization & Data Migration

> **Note**: Existing migrations have added `organization_id` columns and backfilled to default org.
> This phase finalizes the schema and ensures data integrity.

- [x] 0.1 Verify all existing records have `organization_id` set (audit query)
- [x] 0.2 Add NOT NULL constraint to `organization_id` on all entity tables (migration)
- [x] 0.3 Update `user_roles` unique constraint to `(user_id, organization_id, role)`
- [x] 0.4 Add `is_super_admin` boolean column to `user_roles` (default false)
- [x] 0.5 Designate initial super admin(s) - update existing admin user(s)
- [x] 0.6 Create `org_invitations` table with RLS policies (migration)
- [x] 0.7 Add `settings JSONB` column to `organizations` table
- [x] 0.8 Add `is_active` boolean column to `organizations` for soft delete
- [ ] 0.9 Test: Verify RLS policies work correctly after schema changes

> **Implementation**: Created migration `20260111_multitenancy_schema_finalization.sql`

## Phase 1: Organization Context (Foundation)

- [x] 1.1 Create `src/contexts/OrganizationContext.tsx` with provider and hooks
- [x] 1.2 Create `src/hooks/useOrganization.ts` for org-related queries
- [x] 1.3 Wrap `AdminLayout` with `OrganizationProvider`
- [x] 1.5 Add organization name/logo display to admin header
- [x] 1.6 Create `OrgSelector` component for multi-org users
- [x] 1.7 Update React Query queries to use org context where applicable
- [ ] 1.8 Test: Verify single-org user flow works without changes

> **Implementation**: Created `OrganizationContext.tsx`, `useOrganization.ts`, `useOrgQuery.ts`, `OrgSelector.tsx`

## Phase 2: Organization Management (Super Admin)

- [x] 2.1 Create organizations list page at `/admin/organizations`
- [x] 2.2 Create organization detail/edit page at `/admin/organizations/[id]`
- [x] 2.3 Add create organization form with name, slug, logo upload
- [x] 2.4 Add soft-delete functionality for organizations
- [x] 2.5 Create super admin route guard component
- [x] 2.6 Add "Organizations" link to admin sidebar (super admin only)
- [ ] 2.7 Test: Create, update, delete organizations as super admin

> **Implementation**: Created `OrganizationsPage.tsx`, `OrganizationSettingsPage.tsx`, added routes to `App.tsx`

## Phase 3: Member Management (Org Admin)

- [x] 3.1 Create members list page at `/admin/organizations/[id]/members`
- [x] 3.2 Display member list with name, email, role, joined date
- [x] 3.3 Add role update functionality (dropdown to change role)
- [x] 3.4 Add remove member functionality with confirmation
- [x] 3.5 Link members page from organization settings
- [ ] 3.6 Test: View, update, remove members as org admin

> **Implementation**: Created `OrganizationMembersPage.tsx`

## Phase 4: User Invitation System

- [x] 4.1 Create invitation form component (`InviteUserDialog`)
- [x] 4.2 Create pending invitations list page at `/admin/invitations`
- [ ] 4.3 Implement invitation acceptance flow on signup
- [ ] 4.4 Implement invitation acceptance flow for existing users
- [x] 4.5 Add cancel and resend invitation functionality
- [x] 4.6 Generate invitation links with tokens
- [ ] 4.7 Test: Full invitation flow - create, accept, cancel

> **Implementation**: Invitation UI integrated into `OrganizationMembersPage.tsx`, hooks in `useOrganization.ts`

## Phase 5: Login Flow Updates

- [x] 5.1 Query user organizations after successful auth
- [ ] 5.2 Create organization selection modal component
- [x] 5.3 Auto-select for single-org users
- [x] 5.4 Show selector for multi-org users
- [x] 5.5 Persist selection to localStorage
- [ ] 5.6 Handle invitation acceptance during login
- [ ] 5.7 Test: Login flows for single-org and multi-org users

> **Implementation**: `OrganizationContext.tsx` handles org selection, `OrgSelector` component for multi-org

## Phase 6: Data Query Updates

- [ ] 6.1 Update cases queries to include org filter
- [ ] 6.2 Update donations queries to include org filter
- [ ] 6.3 Update followup actions queries to include org filter
- [ ] 6.4 Update charities queries to include org filter
- [ ] 6.5 Update monthly reports queries to include org filter
- [x] 6.6 Invalidate queries on organization switch
- [ ] 6.7 Test: Verify data isolation between organizations

> **Note**: RLS policies handle data isolation at DB level. Frontend filters optional for defense-in-depth.
> **Implementation**: Created `useOrgQuery.ts` utilities. RLS provides authoritative filtering.

## Phase 7: Organization Settings

- [x] 7.1 Create organization settings page
- [x] 7.2 Add logo upload with Supabase storage
- [x] 7.3 Add name and slug editing
- [x] 7.4 Add settings JSONB field for future extensibility
- [ ] 7.5 Test: Update organization settings as org admin

> **Implementation**: Created `OrganizationSettingsPage.tsx`

## Validation & Cleanup

- [ ] 8.1 Run full E2E test of multi-tenant workflow
- [ ] 8.2 Verify RLS policies block cross-org access
- [ ] 8.3 Test organization switching refreshes all data
- [ ] 8.4 Document admin workflows for organization management
- [ ] 8.5 Update any hardcoded organization references

## Dependencies

- **Phase 0** must complete first (schema changes required for all subsequent phases)
- **Phase 1** depends on Phase 0 (org context needs finalized schema)
- **Phases 2-7** all depend on Phase 1 (org context foundation)
- **Phase 2 and Phase 3** can run in parallel after Phase 1
- **Phase 4** depends on Phase 0 (invitations table) and Phase 3 (member UI patterns)
- **Phase 5** depends on Phase 1 (org context)
- **Phase 6** depends on Phase 1 (org context)
- **Phase 7** depends on Phase 2 (org management pages)

## Summary of Implementation

### Files Created
- `supabase/migrations/20260111_multitenancy_schema_finalization.sql` - Schema migration
- `src/contexts/OrganizationContext.tsx` - Organization context provider
- `src/hooks/useOrganization.ts` - Organization query hooks
- `src/hooks/useOrgQuery.ts` - Org-scoped query utilities
- `src/components/admin/OrgSelector.tsx` - Organization selector dropdown
- `src/pages/admin/organizations/OrganizationsPage.tsx` - Org list page
- `src/pages/admin/organizations/OrganizationSettingsPage.tsx` - Org settings page
- `src/pages/admin/organizations/OrganizationMembersPage.tsx` - Members & invitations page

### Files Modified
- `src/components/layouts/AdminLayout.tsx` - Added OrganizationProvider, OrgSelector, super admin sidebar
- `src/App.tsx` - Added organization routes
