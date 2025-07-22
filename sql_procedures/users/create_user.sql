CREATE OR REPLACE PROCEDURE create_user(
    p_name VARCHAR(100),
    p_email VARCHAR(255),
    p_phone VARCHAR(20),
    p_picture VARCHAR(512),
    p_role user_role,
    p_status user_status,
    p_two_fa_enabled BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO USERS (
        name, 
        email, 
        phone, 
        picture, 
        role, 
        status, 
        twoFaEnabled
    ) VALUES (
        p_name,
        p_email,
        p_phone,
        p_picture,
        p_role,
        p_status,
        p_two_fa_enabled
    ) RETURNING *;
END;
$$;