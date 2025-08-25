CREATE OR REPLACE PROCEDURE create_user(
 p_userId UUID,
 p_name JSONB,
 p_email VARCHAR(255),
 p_phone VARCHAR(20),
 p_picture VARCHAR(512),
 p_role user_role,
 p_status user_status,
 p_two_fa_enabled BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN

INSERT INTO USERS (
 userId,
 name,
 email,
 phone,
 picture,
 role,
 status,
 twoFaEnabled
 ) VALUES (
 p_userId,
 p_name,
 p_email,
 p_phone,
 p_picture,
 p_role,
 p_status,
 p_two_fa_enabled
 );
END;
$$;