CREATE OR REPLACE FUNCTION get_admin_authority_by_id(p_admin_authority_id UUID)
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
    FROM ADMINS_AUTHORITIES aa
    WHERE aa.adminAuthorityId = p_admin_authority_id;
END;
$$;