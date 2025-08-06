CREATE OR REPLACE PROCEDURE delete_email(p_email_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM EMAILS
    WHERE emailId = p_email_id;
END;
$$;