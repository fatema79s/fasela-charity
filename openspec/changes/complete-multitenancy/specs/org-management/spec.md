## ADDED Requirements

### Requirement: Organization CRUD Operations
Super administrators SHALL be able to create, read, update, and delete organizations through an admin interface.

#### Scenario: Create new organization
- **WHEN** a super admin submits the create organization form with name and slug
- **THEN** a new organization record is created in the database
- **AND** the organization appears in the organizations list

#### Scenario: Update organization details
- **WHEN** a super admin updates an organization's name, slug, or logo
- **THEN** the changes are persisted to the database
- **AND** the updated information is reflected across the platform

#### Scenario: View organization list
- **WHEN** a super admin navigates to the organizations page
- **THEN** all organizations are displayed with their name, slug, and member count

#### Scenario: Delete organization
- **WHEN** a super admin deletes an organization with no active cases
- **THEN** the organization is soft-deleted (marked inactive)
- **AND** the organization no longer appears in active lists

### Requirement: Organization Member Management
Organization administrators SHALL be able to view and manage members within their organization.

#### Scenario: View organization members
- **WHEN** an org admin navigates to the members page
- **THEN** all users assigned to the organization are displayed with their roles

#### Scenario: Update member role
- **WHEN** an org admin changes a member's role from volunteer to admin
- **THEN** the user's role is updated in the user_roles table
- **AND** the member gains admin permissions immediately

#### Scenario: Remove member from organization
- **WHEN** an org admin removes a member from the organization
- **THEN** the user's role record for that organization is deleted
- **AND** the user loses access to organization data

### Requirement: Organization Settings
Organization administrators SHALL be able to configure organization-specific settings.

#### Scenario: Update organization logo
- **WHEN** an org admin uploads a new logo image
- **THEN** the image is stored in Supabase storage
- **AND** the organization's logo_url is updated

#### Scenario: Update organization name
- **WHEN** an org admin updates the organization name
- **THEN** the name change is reflected in the header and all UI elements

### Requirement: Super Admin Distinction
The system SHALL distinguish between platform-level super administrators and organization-level administrators.

#### Scenario: Super admin access to all organizations
- **WHEN** a super admin logs in
- **THEN** they can view and manage all organizations on the platform

#### Scenario: Org admin restricted to own organization
- **WHEN** an org admin logs in
- **THEN** they can only view and manage their assigned organization(s)

#### Scenario: Super admin creates organization
- **WHEN** a user without super admin flag attempts to create an organization
- **THEN** the action is denied with an authorization error
