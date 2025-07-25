CREATE OR REPLACE PROCEDURE create_email(
    p_title JSONB,
    p_body JSONB,
    p_form_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
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