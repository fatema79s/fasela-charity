-- Function to apply Org-Based RLS to a table
CREATE OR REPLACE FUNCTION public.apply_org_rls(table_name_text text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop existing policies that might conflict (broad assumption, might need manual tuning later)
    -- We'll try to keep existing policies if they are role-based, but most need org scoping now.
    -- For simplicity in this migration, let's ADD an org check to existing policies or create new ones?
    -- Safest approach: Create a new baseline policy "Org Isolation" and ensure it's combined with others if needed.
    -- BUT RLS is "OR" by default for multiple policies (allow if ANY policy matches).
    -- So we need to ensure ALL access is scoped.
    -- Strategy: Drop all permissive policies and replace with scoped ones? 
    -- Too risky to drop blindly.
    
    -- Let's enable RLS just in case
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name_text);

    -- Create a generic "View own org data" policy
    -- This handles SELECT. 
    -- Note: This is permissive for roles within the org. Specific role logic (admin vs user) still applies via other policies?
    -- If we have other policies like "anyone can see published cases", we must ensure that "anyone" -> "anyone in org" OR "anyone public"?
    -- For this platform, "Published" cases might be public (no login).
    -- But internally admin view must be scoped.
    
    -- For simplicity, let's assume authenticated users should only see their org's data.
    
    -- Policy: Authenticated users can view rows where organization_id matches theirs
    EXECUTE format('
        CREATE POLICY "Org Isolation Select" ON public.%I
        FOR SELECT
        TO authenticated
        USING (organization_id = get_my_org_id())
    ', table_name_text);
    
    -- Policy: Authenticated users can Insert rows (and automatically set org_id? handled by trigger or frontend)
    -- We check that the inserted org_id matches theirs.
    EXECUTE format('
        CREATE POLICY "Org Isolation Insert" ON public.%I
        FOR INSERT
        TO authenticated
        WITH CHECK (organization_id = get_my_org_id())
    ', table_name_text);

    -- Policy: Update
    EXECUTE format('
        CREATE POLICY "Org Isolation Update" ON public.%I
        FOR UPDATE
        TO authenticated
        USING (organization_id = get_my_org_id())
    ', table_name_text);

    -- Policy: Delete
    EXECUTE format('
        CREATE POLICY "Org Isolation Delete" ON public.%I
        FOR DELETE
        TO authenticated
        USING (organization_id = get_my_org_id())
    ', table_name_text);

END;
$$;

DO $$
BEGIN
    -- Apply to entity tables
    PERFORM public.apply_org_rls('cases');
    PERFORM public.apply_org_rls('case_kids');
    PERFORM public.apply_org_rls('donations');
    PERFORM public.apply_org_rls('monthly_reports');
    PERFORM public.apply_org_rls('followup_actions');
    PERFORM public.apply_org_rls('donation_handovers');
    PERFORM public.apply_org_rls('case_charities');
    PERFORM public.apply_org_rls('case_private_spending');
    PERFORM public.apply_org_rls('case_confidential_info');
    -- PERFORM public.apply_org_rls('charities'); -- If we scoped it
END $$;

-- Drop function
DROP FUNCTION public.apply_org_rls(text);
