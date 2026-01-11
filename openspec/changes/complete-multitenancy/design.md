# Design: Complete Multi-Tenancy Implementation

## Context

Yateem Care Connect is a charity case management platform. The database has been prepared for multi-tenancy with:
- `organizations` table with id, name, slug, logo_url
- `organization_id` foreign key added to all major entities
- RLS policies enforcing `organization_id = get_my_org_id()`
- `user_roles.organization_id` linking users to organizations
- Triggers auto-setting `organization_id` on insert

The application layer needs to be updated to:
1. Manage organization context in the frontend
2. Provide UI for organization CRUD operations
3. Handle user onboarding and invitation flows

## Goals

- Enable multiple charity organizations to use the platform independently
- Provide seamless organization switching for users in multiple orgs
- Maintain data isolation through existing RLS + frontend guards
- Keep the implementation simple and leverage existing patterns

## Non-Goals

- Cross-organization data sharing or federation
- Organization hierarchy (parent/child organizations)
- Custom theming per organization (beyond logo)
- White-label/subdomain routing (use single domain with org selector)

## Decisions

### 1. Organization Context Architecture

**Decision**: Use React Context with localStorage persistence

```
OrganizationProvider
├── currentOrg: Organization | null
├── userOrgs: Organization[]
├── setCurrentOrg: (org) => void
└── isLoading: boolean
```

**Rationale**:
- Consistent with existing React Query patterns
- LocalStorage provides persistence across page reloads
- Context allows any component to access org data

**Alternatives Considered**:
- URL-based org routing (`/org/:slug/admin`) - Rejected: adds complexity, breaks existing routes
- Zustand/Redux - Rejected: overkill for single piece of state

### 2. Organization Selection Flow

**Decision**: Modal selector on login for multi-org users

Flow:
1. User logs in via Supabase Auth
2. Query `user_roles` to get all organizations user belongs to
3. If single org → auto-select and proceed
4. If multiple orgs → show org selector modal
5. Store selection in localStorage as `selectedOrgId`

**Rationale**: Non-intrusive, handles edge cases, doesn't change existing auth flow

### 3. Super Admin vs Org Admin

**Decision**: Add `is_super_admin` boolean to user_roles, keep existing `admin` role for org-level admins

- `is_super_admin = true`: Can create organizations, assign users to any org
- `role = 'admin'` + `organization_id`: Admin within specific organization

**Rationale**:
- Minimal schema change (single boolean)
- Clear separation of platform vs org permissions
- Backward compatible with existing role checks

### 4. User Invitation System

**Decision**: Email-based invitation with pending state

Schema addition:
```sql
CREATE TABLE org_invitations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  role app_role DEFAULT 'volunteer',
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, expired
  token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Flow:
1. Org admin enters email + role
2. System creates invitation record with unique token
3. Invitation email sent (manual or via Supabase Edge Function later)
4. User signs up/logs in with that email → matched to pending invitation
5. User added to organization with specified role

**Rationale**: Simple, secure, scalable pattern

### 5. Data Query Pattern

**Decision**: All org-scoped queries continue using RLS; frontend adds `organization_id` filter for clarity

```typescript
// Current (RLS handles filtering)
supabase.from('cases').select('*')

// After (explicit + RLS double-check)
supabase.from('cases').select('*').eq('organization_id', currentOrgId)
```

**Rationale**: Defense in depth - RLS is authoritative, frontend filter provides UI correctness

## Component Architecture

```
src/
├── contexts/
│   └── OrganizationContext.tsx    # New: org state management
├── hooks/
│   └── useOrganization.ts         # New: org query hooks
├── pages/admin/
│   ├── organizations/
│   │   ├── index.tsx              # New: org list (super admin)
│   │   └── [id]/
│   │       ├── settings.tsx       # New: org settings
│   │       └── members.tsx        # New: member management
│   └── invitations.tsx            # New: pending invitations
├── components/
│   ├── OrgSelector.tsx            # New: org switcher dropdown
│   └── InviteUserDialog.tsx       # New: invitation modal
└── layouts/
    └── AdminLayout.tsx            # Modified: wrap with OrgProvider
```

## Database Changes

### New Table: org_invitations
- Tracks pending user invitations
- Enables invite-based onboarding

### Modified: user_roles
- Add `is_super_admin BOOLEAN DEFAULT FALSE`

### Modified: organizations (optional)
- Add `settings JSONB DEFAULT '{}'` for future extensibility

## Migration Strategy

1. **Phase 1**: Organization context + selector (existing users continue working)
2. **Phase 2**: Super admin UI for org management
3. **Phase 3**: Invitation system for user onboarding
4. **Phase 4**: Organization settings and customization

Each phase is independently deployable and testable.

## Risks & Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users losing access during migration | High | Default org assignment migration script |
| Performance with org context queries | Low | Indexed organization_id columns (already done) |
| Invitation token security | Medium | Short expiry (7 days), single-use tokens |
| Complex multi-org user flows | Medium | Clear UI indicators of current organization |

## Open Questions

1. Should organizations have a subscription/tier system? (Defer to future)
2. Email delivery mechanism for invitations? (Start with manual, add automation later)
3. Organization deletion policy? (Soft delete recommended)
