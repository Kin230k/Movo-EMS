-- change update_user to patch only non-null params
CREATE OR REPLACE PROCEDURE update_user(p_auth_user_id UUID,
 p_user_id UUID,
 p_name JSONB DEFAULT NULL,
 p_email VARCHAR(255) DEFAULT NULL,
 p_phone VARCHAR(20) DEFAULT NULL,
 p_picture VARCHAR(512) DEFAULT NULL,
 p_role user_role DEFAULT NULL,
 p_status user_status DEFAULT NULL,
 p_two_fa_enabled BOOLEAN DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_user');

UPDATE users
 SET
 name = COALESCE(p_name, name),
 email = COALESCE(p_email, email),
 phone = COALESCE(p_phone, phone),
 picture = COALESCE(p_picture, picture),
 role = COALESCE(p_role, role),
 status = COALESCE(p_status, status),
 twofaenabled = COALESCE(p_two_fa_enabled, twofaenabled)
 WHERE userId = p_user_id;
END;
$$;
