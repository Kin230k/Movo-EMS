CREATE OR REPLACE FUNCTION get_email_by_id(p_email_id UUID)
RETURNS TABLE (
    emailId UUID,
    title JSONB,
    body JSONB,
    formId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_email_by_id');

RETURN QUERY 
    SELECT 
        e.emailId,
        e.title,
        e.body,
        e.formId
    FROM EMAILS e
    WHERE e.emailId = p_email_id;
END;
$$;