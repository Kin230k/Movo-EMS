CREATE OR REPLACE PROCEDURE update_authority(
    p_authority_id UUID,
    p_name VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE AUTHORITIES
    SET name = p_name
    WHERE authorityId = p_authority_id;
END;
$$;