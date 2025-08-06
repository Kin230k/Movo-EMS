CREATE OR REPLACE FUNCTION get_all_emails()
RETURNS TABLE (
    emailId UUID,
    title JSONB,
    body JSONB,
    formId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_emails');

RETURN QUERY 
    SELECT 
        e.emailId,
        e.title,
        e.body,
        e.formId
    FROM EMAILS e;
END;
$$;