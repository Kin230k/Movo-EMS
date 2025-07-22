CREATE OR REPLACE PROCEDURE delete_admin_authority(p_admin_authority_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ADMINS_AUTHORITIES
    WHERE adminAuthorityId = p_admin_authority_id;
END;
$$;