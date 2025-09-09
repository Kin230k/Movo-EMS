CREATE OR REPLACE FUNCTION get_email_by_id(p_auth_user_id UUID,p_email_id UUID)
RETURNS TABLE (
    emailId UUID,
    title TEXT,  -- Changed from JSONB to TEXT
    body TEXT,   -- Changed from JSONB to TEXT
    formId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_email_by_id');

RETURN QUERY 
    SELECT 
        e.emailId,
        e.title,  -- Now returns TEXT
        e.body,   -- Now returns TEXT
        e.formId
    FROM EMAILS e
    WHERE e.emailId = p_email_id;
END;
$$;