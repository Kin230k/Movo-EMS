CREATE OR REPLACE FUNCTION get_emails_by_form(p_auth_user_id UUID, p_form_id UUID)
RETURNS TABLE (
    emailId UUID,
    title JSONB,
    body JSONB,
    formId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_emails_by_form');

    RETURN QUERY 
    SELECT 
        e.emailId,
        e.title,
        e.body,
        e.formId
    FROM EMAILS e
    WHERE e.formId = p_form_id;
END;
$$;