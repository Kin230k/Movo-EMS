CREATE OR REPLACE PROCEDURE update_email(p_auth_user_id UUID,
 p_email_id UUID,
 p_title TEXT DEFAULT NULL,  -- Changed from JSONB to TEXT
 p_body TEXT DEFAULT NULL,   -- Changed from JSONB to TEXT
 p_form_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_email');

UPDATE EMAILS
 SET
 title = COALESCE(p_title, title),  -- Now accepts TEXT
 body = COALESCE(p_body, body),     -- Now accepts TEXT
 formId = COALESCE(p_form_id, formId)
 WHERE emailId = p_email_id;
END;
$$;