CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    phone VARCHAR(20),
    picture VARCHAR(512)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        u.user极端的,
        u.name,
        u.email,
        u.phone,
        u.picture
    FROM USERS u;
END;
$$;