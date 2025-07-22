CREATE OR REPLACE PROCEDURE create_email(
    p_title VARCHAR(255),
    p_body TEXT,
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