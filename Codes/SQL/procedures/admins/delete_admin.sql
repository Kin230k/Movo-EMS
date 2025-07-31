CREATE OR REPLACE PROCEDURE delete_admin(p_admin_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ADMINS
    WHERE adminId = p_admin_id;
END;
$$;