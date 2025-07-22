CREATE OR REPLACE PROCEDURE update_email(
    p_email_id UUID,
    p_title VARCHAR(255),
    p_body TEXT,
    p_form_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE EMAILS
    SET 
        title = p_title,
        body = p_body,
        formId = p_form_id
    WHERE emailId = p_email_id;
END;
$$;