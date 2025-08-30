CREATE OR REPLACE PROCEDURE create_email(p_auth_user_id UUID,
 p_title TEXT,  -- Changed from JSONB to TEXT
 p_body TEXT,   -- Changed from JSONB to TEXT
 p_form_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_email');

INSERT INTO EMAILS (
 emailId,
 title,
 body,
 formId
 ) VALUES (
 gen_random_uuid(),
 p_title,  -- Now accepts TEXT
 p_body,   -- Now accepts TEXT
 p_form_id
 );
END;
$$;