CREATE OR REPLACE PROCEDURE create_email(p_auth_user_id UUID, 
    p_title JSONB,
    p_body JSONB,
    p_form_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_email');

INSERT INTO EMAILS (
        emailId,
        title, 
        body, 
        formId
    ) VALUES (
        gen_random_uuid(),
        p_title,
        p_body,
        p_form_id
    ) ;
END;
$$;