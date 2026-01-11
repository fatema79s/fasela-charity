import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Uses the same anon key and URL from the project client.ts
const SUPABASE_URL = 'https://xbwnjfdzbnyvaxmqufrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid25qZmR6Ym55dmF4bXF1ZnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTU5ODIsImV4cCI6MjA1ODM5MTk4Mn0.4-BgbiXxUcR6k7zMRpC1BPRKapqrai6LsOxETi_hYtk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  try {
    console.log('Starting test-accept-invitation script');

    // 1. Find or create an organization to use
    let { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (orgError) throw orgError;

    if (!org) {
      const name = 'Test Org ' + Date.now();
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
        .select()
        .single();
      if (createOrgError) throw createOrgError;
      org = newOrg;
      console.log('Created org', org.id);
    } else {
      console.log('Using existing org', org.id);
    }

    // 2. Create a test user via signUp
    const testEmail = `test+accept-${Date.now()}@example.com`;
    const testPassword = 'Testpass123!';

    console.log('Signing up test user', testEmail);
    let { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: testEmail, password: testPassword });
    if (signUpError) {
      // Sometimes signUp may fail if email already exists; try to signIn
      console.warn('signUp error (continuing):', signUpError.message || signUpError);
    } else {
      console.log('signUp returned user:', signUpData?.user?.id);
    }

    // Try to get the user id by looking up the user by email in auth.users via REST: not available, so query profiles/ user_roles not helpful.
    // Instead, try to sign in to get a session and user id.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
    if (signInError) {
      console.warn('signIn error (continuing):', signInError.message || signInError);
    }

    const userId = signInData?.user?.id || signUpData?.user?.id;
    if (!userId) {
      throw new Error('Could not obtain user id for test user (signUp/signIn may require email confirmation).');
    }
    console.log('Test user id:', userId);

    // 3. Insert a pending org_invitations row
    // Creating invitations is usually restricted by RLS. If you provide a SUPABASE_SERVICE_ROLE_KEY
    // as an env var when running this script, we'll use it to create the invitation (bypass RLS).
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

    let invitation = null;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error('\nERROR: This project enforces row-level security for creating invitations.');
      console.error('To run this automated end-to-end test you must provide a Supabase service role key.');
      console.error('Run the script like this (macOS / zsh):');
      console.error('\n  SUPABASE_SERVICE_ROLE_KEY="<your-service-key>" node scripts/test-accept-invitation.mjs\n');
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY — cannot create invitation under RLS');
    }

    // Use an admin client to create the invitation bypassing RLS
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(SUPABASE_URL, serviceKey);

    const { data: inviteData, error: inviteError } = await admin
      .from('org_invitations')
      .insert({
        organization_id: org.id,
        email: testEmail,
        role: 'user',
        token,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;
    invitation = inviteData;
    console.log('Created invitation token (admin):', token);

    // 4. Perform the accept flow: upsert into user_roles twice to test idempotency
    console.log('First upsert into user_roles');
    let { error: roleError1 } = await supabase.from('user_roles').upsert(
      {
        user_id: userId,
        organization_id: org.id,
        role: 'user',
      },
      { onConflict: 'user_id,organization_id,role' }
    );
    if (roleError1) throw roleError1;
    console.log('First upsert succeeded');

    console.log('Second upsert into user_roles (should be idempotent)');
    let { error: roleError2 } = await supabase.from('user_roles').upsert(
      {
        user_id: userId,
        organization_id: org.id,
        role: 'user',
      },
      { onConflict: 'user_id,organization_id,role' }
    );
    if (roleError2) throw roleError2;
    console.log('Second upsert succeeded — no duplicate-key error');

    // 5. Update invitation status to accepted
    const { error: updateError } = await supabase
      .from('org_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);
    if (updateError) throw updateError;
    console.log('Invitation status updated to accepted');

    // 6. Verify user_roles exists
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', org.id);
    if (rolesError) throw rolesError;
    console.log('user_roles rows for test user/org:', rolesData);

    // Cleanup: delete invitation (optional)
    await supabase.from('org_invitations').delete().eq('id', invitation.id);
    console.log('Cleaned up invitation');

    console.log('Test completed successfully');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  }
}

run();
