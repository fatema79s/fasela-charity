## ADDED Requirements

### Requirement: Organization ID Constraint Enforcement
All organization-scoped tables SHALL enforce NOT NULL constraints on organization_id columns after data backfill is verified.

#### Scenario: Prevent null organization_id on insert
- **WHEN** a new record is inserted without organization_id
- **THEN** the database rejects the insert with a constraint violation
- **AND** an appropriate error message is returned

#### Scenario: Verify existing data backfill
- **WHEN** an administrator runs the data audit query
- **THEN** zero records are returned with NULL organization_id
- **AND** the NOT NULL constraint can be safely applied

### Requirement: User Roles Multi-Organization Support
The user_roles table SHALL support users having different roles across multiple organizations.

#### Scenario: User with roles in multiple organizations
- **WHEN** a user is assigned admin role in Org A and volunteer role in Org B
- **THEN** two separate user_roles records exist
- **AND** the unique constraint `(user_id, organization_id, role)` allows this

#### Scenario: Prevent duplicate role in same organization
- **WHEN** an admin attempts to assign the same role twice in the same organization
- **THEN** the database rejects the duplicate with a constraint violation

### Requirement: Super Admin Flag
The system SHALL distinguish platform super administrators via an is_super_admin flag on user_roles.

#### Scenario: Super admin identification
- **WHEN** a user has is_super_admin set to true on any role record
- **THEN** they are granted platform-level administrative access
- **AND** can manage all organizations

#### Scenario: Default non-super-admin
- **WHEN** a new user_roles record is created
- **THEN** is_super_admin defaults to false
- **AND** the user has only organization-level permissions

### Requirement: Organization Invitations Schema
The system SHALL store invitation records with expiration and status tracking.

#### Scenario: Create invitation record
- **WHEN** an org admin creates an invitation
- **THEN** a record is created with email, role, organization_id, token, and expires_at
- **AND** the status is set to 'pending'

#### Scenario: Invitation expiration enforcement
- **WHEN** an invitation's expires_at timestamp has passed
- **THEN** the invitation cannot be accepted
- **AND** attempting to accept returns an expiration error

#### Scenario: Invitation token uniqueness
- **WHEN** an invitation is created
- **THEN** a unique token is generated
- **AND** the token can be used to look up the invitation

### Requirement: Organization Soft Delete Support
Organizations SHALL support soft deletion via an is_active flag.

#### Scenario: Soft delete organization
- **WHEN** a super admin deletes an organization
- **THEN** is_active is set to false
- **AND** the organization is excluded from active listings

#### Scenario: Inactive organization data preservation
- **WHEN** an organization is soft deleted
- **THEN** all related data (cases, donations, users) remains intact
- **AND** can be restored by setting is_active to true
