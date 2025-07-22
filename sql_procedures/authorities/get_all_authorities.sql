CREATE OR REPLACE FUNCTION get_all_authorities()
RETURNS TABLE (authorityId UUID, name VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.authorityId,
        a.name
    FROM AUTHORITIES a;
END;
$$;