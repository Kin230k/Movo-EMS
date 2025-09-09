CREATE OR REPLACE PROCEDURE edit_user_info(p_auth_user_id UUID,
 p_user_id UUID,
 p_name JSONB,
 p_picture TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'edit_user_info');

-- Only update the multilingual name and picture fields; all other columns are left as-is.
UPDATE users
 SET
 name = CASE WHEN p_name IS NOT NULL THEN p_name ELSE name END,
 picture = COALESCE(p_picture, picture)
 WHERE userId = p_user_id;
END;
$$;
