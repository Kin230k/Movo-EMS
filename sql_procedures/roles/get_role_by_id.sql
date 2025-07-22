CREATE OR REPLACE FUNCTION get_role_by_id(p_role_id UUID)
RETURNS TABLE (roleId UUID, name VARCHAR(100), description TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT r.roleId, r.name, r.description
    FROM ROLES r
    WHERE r.roleId = p_role_id;
END;
$$;