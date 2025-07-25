CREATE OR REPLACE PROCEDURE create_email(
    p_title JSONB,
    p_body JSONB,
    p_form_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO EMAILS (
        title, 
        body, 
        formId
    ) VALUES (
        p_title,
        p_body,
        p_form_id
    ) RETURNING *;
END;
$$;