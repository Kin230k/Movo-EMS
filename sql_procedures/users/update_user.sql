CREATE OR REPLACE PROCEDURE update_user(
    p_user_id UUID,
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
    UPDATE USERS
    SET 
        name = p_name,
        email = p_email,
        phone = p_phone,
        picture = p_picture,
        role = p_role,
        status = p_status,
        twoFaEnabled = p_two_fa_enabled
    WHERE userId = p_user_id;
END;
$$;