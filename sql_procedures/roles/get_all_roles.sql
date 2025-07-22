CREATE OR REPLACE FUNCTION get_all_roles()
RETURNS TABLE (roleId UUID, name VARCHAR(100), description TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT r.roleId, r.name, r.description
    FROM ROLES r;
END;
$$;