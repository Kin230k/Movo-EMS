CREATE OR REPLACE PROCEDURE create_admin_authority(
    p_admin_id UUID,
    p_authority_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ADMINS_AUTHORITIES (
        adminId, 
        authorityId
    ) VALUES (
        p_admin_id,
        p_authority_id
    ) RETURNING *;
END;
$$;