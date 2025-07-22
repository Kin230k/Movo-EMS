CREATE OR REPLACE FUNCTION get_all_emails()
RETURNS TABLE (
    emailId UUID,
    title VARCHAR(255),
    body TEXT,
    formId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        e.emailId,
        e.title,
        e.body,
        e.formId
    FROM EMAILS e;
END;
$$;