CREATE OR REPLACE PROCEDURE update_email(p_auth_user_id UUID, 
    p_email_id UUID,
    p_title JSONB DEFAULT NULL,
    p_body JSONB DEFAULT NULL,
    p_form_id UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_email');

UPDATE EMAILS
    SET 
        title = COALESCE(p_title, title),
        body = COALESCE(p_body, body),
        formId = COALESCE(p_form_id, formId)
    WHERE emailId = p_email_id;
END;
$$;