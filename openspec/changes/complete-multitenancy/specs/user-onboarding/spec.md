## ADDED Requirements

### Requirement: User Invitation System
Organization administrators SHALL be able to invite new users to their organization via email.

#### Scenario: Create invitation
- **WHEN** an org admin enters an email address and selects a role
- **THEN** an invitation record is created with a unique token
- **AND** the invitation appears in the pending invitations list

#### Scenario: Invitation with expiration
- **WHEN** an invitation is created
- **THEN** it is assigned an expiration date (7 days from creation)
- **AND** expired invitations cannot be accepted

#### Scenario: Duplicate invitation prevention
- **WHEN** an admin attempts to invite an already-invited email
- **THEN** the system shows an error indicating a pending invitation exists
- **AND** no duplicate invitation is created

#### Scenario: Re-invite expired invitation
- **WHEN** an admin re-invites an email with an expired invitation
- **THEN** a new invitation with fresh expiration is created
- **AND** the old invitation is marked as superseded

### Requirement: Invitation Acceptance
Invited users SHALL be able to accept invitations and join organizations.

#### Scenario: Accept invitation as new user
- **WHEN** an invited user signs up with the matching email
- **THEN** the pending invitation is automatically matched
- **AND** the user is added to the organization with the specified role

#### Scenario: Accept invitation as existing user
- **WHEN** an existing user logs in with an email that has pending invitations
- **THEN** they are prompted to accept the pending invitation(s)
- **AND** accepting adds them to the organization

#### Scenario: Decline invitation
- **WHEN** a user declines an invitation
- **THEN** the invitation is marked as declined
- **AND** the user is not added to the organization

#### Scenario: Accept invitation via link
- **WHEN** a user clicks an invitation link with a valid token
- **THEN** they are directed to sign up or log in
- **AND** the invitation is pre-filled for acceptance

### Requirement: Invitation Management
Organization administrators SHALL be able to view and manage pending invitations.

#### Scenario: View pending invitations
- **WHEN** an org admin navigates to the invitations page
- **THEN** all pending invitations for their organization are displayed
- **AND** shows email, role, invited date, and expiration status

#### Scenario: Cancel pending invitation
- **WHEN** an org admin cancels a pending invitation
- **THEN** the invitation is marked as cancelled
- **AND** the token is invalidated

#### Scenario: Resend invitation
- **WHEN** an org admin resends an invitation
- **THEN** a new token and expiration are generated
- **AND** the invitation link is refreshed

### Requirement: User Organization Assignment
The system SHALL support assigning users to organizations with specific roles.

#### Scenario: Assign user to organization
- **WHEN** a super admin assigns a user to an organization
- **THEN** a user_roles record is created with the specified role and org_id
- **AND** the user gains access to organization data

#### Scenario: User with multiple organizations
- **WHEN** a user is assigned to a second organization
- **THEN** they have separate role records for each organization
- **AND** can switch between organizations using the selector

#### Scenario: Remove user from organization
- **WHEN** an admin removes a user from an organization
- **THEN** the user_roles record for that org is deleted
- **AND** the user loses access to that organization's data

### Requirement: Default Organization Assignment
New users SHALL be assigned to a default organization if no invitation exists.

#### Scenario: New user without invitation
- **WHEN** a user signs up without a pending invitation
- **THEN** they are assigned to the default organization (yateem-care)
- **AND** given the default role (user)

#### Scenario: Configurable default organization
- **WHEN** no default organization is configured
- **THEN** new users without invitations cannot complete signup
- **AND** an error message instructs them to request an invitation
