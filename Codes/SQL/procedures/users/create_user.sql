CREATE OR REPLACE PROCEDURE create_user(p_auth_user_id UUID, 
    p_name JSONB,
    p_email VARCHAR(255),
    p_phone VARCHAR(20),
    p_picture VARCHAR(512),
    p_role user_role,
    p_status user_status,
    p_two_fa_enabled BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_user');

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
        gen_random_uuid(),
        p_name,
        p_email,
        p_phone,
        p_picture,
        p_role,
        p_status,
        p_two_fa_enabled
    ) ;
END;
$$;