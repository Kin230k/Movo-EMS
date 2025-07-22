CREATE OR REPLACE PROCEDURE update_admin_authority(
    p_admin_authority_id UUID,
    p_admin_id UUID,
    p_authority_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ADMINS_AUTHORITIES
    SET 
        adminId = p_admin_id,
        authorityId = p_authority_id
    WHERE adminAuthorityId = p_admin_authority_id;
END;
$$;