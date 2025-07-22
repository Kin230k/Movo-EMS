CREATE OR REPLACE PROCEDURE delete_authority(p_authority_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM AUTHORITIES
    WHERE authorityId = p_authority_id;
END;
$$;