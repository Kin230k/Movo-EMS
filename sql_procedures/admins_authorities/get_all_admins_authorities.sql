CREATE OR REPLACE FUNCTION get_all_admin_authorities()
RETURNS TABLE (
    adminAuthorityId UUID,
    adminId UUID,
    authorityId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        aa.adminAuthorityId,
        aa.adminId,
        aa.authorityId
    FROM ADMINS_AUTHORITIES aa;
END;
$$;