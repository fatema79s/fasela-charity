## ADDED Requirements

### Requirement: Organization Context Provider
The application SHALL maintain organization context state accessible to all components through a React Context provider.

#### Scenario: Organization context initialization
- **WHEN** an authenticated user loads the application
- **THEN** the OrganizationProvider queries user's organizations from user_roles
- **AND** sets the current organization from localStorage or first available org

#### Scenario: Access current organization
- **WHEN** any component calls useOrganization hook
- **THEN** it receives the current organization object with id, name, slug, and logo_url

#### Scenario: Organization context loading state
- **WHEN** the organization context is initializing
- **THEN** components receive isLoading=true
- **AND** can display appropriate loading indicators

### Requirement: Organization Selector
Users belonging to multiple organizations SHALL be able to switch between them using a selector component.

#### Scenario: Single organization user
- **WHEN** a user belongs to only one organization
- **THEN** the organization name is displayed without a dropdown
- **AND** no switcher UI is shown

#### Scenario: Multi-organization user switching
- **WHEN** a user belongs to multiple organizations and clicks the org selector
- **THEN** a dropdown displays all their organizations
- **AND** selecting one updates the current organization context

#### Scenario: Organization switch persistence
- **WHEN** a user switches to a different organization
- **THEN** the selection is saved to localStorage
- **AND** persists across page reloads and browser sessions

#### Scenario: Organization switch data refresh
- **WHEN** a user switches organizations
- **THEN** all cached queries are invalidated
- **AND** data is refetched for the new organization context

### Requirement: Organization-Scoped Data Queries
All data queries for organization-scoped entities SHALL include the current organization context.

#### Scenario: Query cases for current organization
- **WHEN** the cases list is loaded
- **THEN** only cases belonging to the current organization are returned

#### Scenario: Create entity with organization context
- **WHEN** a user creates a new case, donation, or other org-scoped entity
- **THEN** the organization_id is automatically set from context
- **AND** the database trigger validates the assignment

#### Scenario: Prevent cross-organization access
- **WHEN** a user attempts to access an entity from another organization
- **THEN** the RLS policy blocks the request
- **AND** an appropriate error is displayed

### Requirement: Organization Branding Display
The application SHALL display organization branding elements based on the current context.

#### Scenario: Display organization logo in header
- **WHEN** the admin layout renders
- **THEN** the current organization's logo is displayed in the header
- **AND** falls back to a default icon if no logo is set

#### Scenario: Display organization name
- **WHEN** the admin header renders
- **THEN** the current organization's name is displayed alongside the logo

### Requirement: Login Organization Selection
Users with multiple organizations SHALL select an organization during login flow.

#### Scenario: Auto-select single organization
- **WHEN** a user with one organization logs in
- **THEN** that organization is automatically selected
- **AND** the user proceeds directly to the dashboard

#### Scenario: Prompt for organization selection
- **WHEN** a user with multiple organizations logs in
- **THEN** an organization selection modal is displayed
- **AND** the user must select one before proceeding

#### Scenario: Remember last organization
- **WHEN** a user with localStorage preference logs in
- **THEN** the previously selected organization is pre-selected
- **AND** they can proceed without re-selecting
